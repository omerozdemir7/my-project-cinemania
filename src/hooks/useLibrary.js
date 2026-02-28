import { useEffect, useRef, useState } from 'react';
import {
  getFirebaseAuth,
  getFirebaseAuthModule,
  getFirebaseDb,
  getFirebaseFirestoreModule,
} from '../utils/firebase';

const LOCAL_LIBRARY_KEY = 'myLibrary';
const FIRESTORE_DISABLED_USERS = new Set();
let hasLoggedFirestoreFallback = false;

function createLoginRequiredError() {
  const error = new Error('Login required');
  error.code = 'auth/login-required';
  return error;
}

function readLocalLibrary() {
  try {
    const raw = localStorage.getItem(LOCAL_LIBRARY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function writeLocalLibrary(library) {
  try {
    const unique = Array.from(new Set(library.map(Number).filter(Number.isFinite)));
    localStorage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(unique));
  } catch {
    // ignore localStorage failures (privacy mode, blocked storage, etc.)
  }
}

function shouldDisableFirestore(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  return (
    code === 'permission-denied' ||
    code === 'unauthenticated' ||
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    code.endsWith('/permission-denied') ||
    code.endsWith('/unauthenticated') ||
    code.endsWith('/unavailable') ||
    code.endsWith('/failed-precondition')
  );
}

function isFirestoreDisabledForUser(uid) {
  return typeof uid === 'string' && FIRESTORE_DISABLED_USERS.has(uid);
}

function markFirestoreDisabledForUser(uid, error) {
  if (typeof uid === 'string' && uid) {
    FIRESTORE_DISABLED_USERS.add(uid);
  }

  if (!hasLoggedFirestoreFallback) {
    const code = typeof error?.code === 'string' ? error.code : 'unknown';
    console.warn(
      `[useLibrary] Firestore disabled (${code}). Falling back to localStorage.`,
    );
    hasLoggedFirestoreFallback = true;
  }
}

export function useLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const firestoreDisabledRef = useRef(false);
  const authRef = useRef(null);
  const authModuleRef = useRef(null);
  const dbRef = useRef(null);
  const firestoreModuleRef = useRef(null);
  const initPromiseRef = useRef(null);

  const ensureFirebaseClients = async () => {
    if (!initPromiseRef.current) {
      initPromiseRef.current = Promise.all([
        getFirebaseAuth(),
        getFirebaseAuthModule(),
        getFirebaseDb(),
        getFirebaseFirestoreModule(),
      ]).then(([auth, authModule, db, firestoreModule]) => {
        authRef.current = auth;
        authModuleRef.current = authModule;
        dbRef.current = db;
        firestoreModuleRef.current = firestoreModule;

        return { auth, authModule, db, firestoreModule };
      });
    }

    return initPromiseRef.current;
  };

  const loadLibrary = async () => {
    setLoading(true);

    try {
      const { auth, db, firestoreModule } = await ensureFirebaseClients();
      const user = auth.currentUser;

      if (!user) {
        setLibrary([]);
        setLoading(false);
        return;
      }

      if (isFirestoreDisabledForUser(user.uid)) {
        firestoreDisabledRef.current = true;
      }

      if (!firestoreDisabledRef.current) {
        const userRef = firestoreModule.doc(db, 'users', user.uid);

        try {
          const docSnap = await firestoreModule.getDoc(userRef);
          if (docSnap.exists()) {
            const remoteLibrary = docSnap.data().library || [];
            const normalized = Array.isArray(remoteLibrary)
              ? remoteLibrary.map(Number).filter(Number.isFinite)
              : [];
            setLibrary(normalized);
            writeLocalLibrary(normalized);
          } else {
            setLibrary([]);
            writeLocalLibrary([]);
          }
        } catch (error) {
          if (shouldDisableFirestore(error)) {
            firestoreDisabledRef.current = true;
            markFirestoreDisabledForUser(user.uid, error);
          } else {
            console.error('[useLibrary] Firestore load failed:', error);
          }

          setLibrary(readLocalLibrary());
        }
      } else {
        setLibrary(readLocalLibrary());
      }
    } catch (error) {
      console.error('[useLibrary] Firebase init failed:', error);
      setLibrary(readLocalLibrary());
    }

    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    const initSubscription = async () => {
      try {
        const { auth, authModule } = await ensureFirebaseClients();

        if (!isMounted) return;

        await loadLibrary();

        unsubscribe = authModule.onAuthStateChanged(auth, (nextUser) => {
          firestoreDisabledRef.current = isFirestoreDisabledForUser(
            nextUser?.uid || '',
          );
          loadLibrary();
        });
      } catch (error) {
        console.error('[useLibrary] Auth observer setup failed:', error);
        if (isMounted) {
          setLibrary(readLocalLibrary());
          setLoading(false);
        }
      }
    };

    initSubscription();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const addToLibrary = async (movieId) => {
    const id = Number(movieId);
    if (!Number.isFinite(id)) return;

    const { auth, db, firestoreModule } = await ensureFirebaseClients();
    const user = auth.currentUser;

    if (!user) throw createLoginRequiredError();

    const localList = readLocalLibrary();
    if (!localList.includes(id)) {
      const next = [...localList, id];
      writeLocalLibrary(next);
      setLibrary(next);
    }

    if (!firestoreDisabledRef.current) {
      const userRef = firestoreModule.doc(db, 'users', user.uid);

      try {
        await firestoreModule.setDoc(
          userRef,
          { library: firestoreModule.arrayUnion(id) },
          { merge: true },
        );
      } catch (error) {
        if (shouldDisableFirestore(error)) {
          firestoreDisabledRef.current = true;
          markFirestoreDisabledForUser(user.uid, error);
        } else {
          console.error('[useLibrary] Firestore add sync failed:', error);
        }
      }
    }
  };

  const removeFromLibrary = async (movieId) => {
    const id = Number(movieId);
    if (!Number.isFinite(id)) return;

    const { auth, db, firestoreModule } = await ensureFirebaseClients();
    const user = auth.currentUser;

    if (!user) throw createLoginRequiredError();

    const next = readLocalLibrary().filter((item) => item !== id);
    writeLocalLibrary(next);
    setLibrary(next);

    if (!firestoreDisabledRef.current) {
      const userRef = firestoreModule.doc(db, 'users', user.uid);

      try {
        await firestoreModule.setDoc(
          userRef,
          { library: firestoreModule.arrayRemove(id) },
          { merge: true },
        );
      } catch (error) {
        if (shouldDisableFirestore(error)) {
          firestoreDisabledRef.current = true;
          markFirestoreDisabledForUser(user.uid, error);
        } else {
          console.error('[useLibrary] Firestore remove sync failed:', error);
        }
      }
    }
  };

  const isInLibrary = (movieId) => {
    return library.includes(Number(movieId));
  };

  return {
    library,
    loading,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    refreshLibrary: loadLibrary,
  };
}
