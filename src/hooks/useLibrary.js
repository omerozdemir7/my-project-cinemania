import { useState, useEffect, useRef } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../utils/firebase';

const LOCAL_LIBRARY_KEY = 'myLibrary';

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

export function useLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const firestoreDisabledRef = useRef(false);

  const loadLibrary = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (!user) {
      setLibrary([]);
      setLoading(false);
      return;
    }

    if (!firestoreDisabledRef.current) {
      const userRef = doc(db, 'users', user.uid);
      try {
        const docSnap = await getDoc(userRef);
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
        console.error('[useLibrary] Firestore load failed:', error);
        if (shouldDisableFirestore(error)) {
          firestoreDisabledRef.current = true;
        }
        setLibrary(readLocalLibrary());
      }
    } else {
      setLibrary(readLocalLibrary());
    }

    setLoading(false);
  };

  useEffect(() => {
    loadLibrary();

    const unsubscribe = onAuthStateChanged(auth, () => {
      firestoreDisabledRef.current = false;
      loadLibrary();
    });

    return unsubscribe;
  }, []);

  const addToLibrary = async (movieId) => {
    const user = auth.currentUser;
    const id = Number(movieId);

    if (!Number.isFinite(id)) return;

    if (!user) throw createLoginRequiredError();

    const localList = readLocalLibrary();
    if (!localList.includes(id)) {
      const next = [...localList, id];
      writeLocalLibrary(next);
      setLibrary(next);
    }

    if (!firestoreDisabledRef.current) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, { library: arrayUnion(id) }, { merge: true });
      } catch (error) {
        console.error('[useLibrary] Firestore add sync failed:', error);
        if (shouldDisableFirestore(error)) {
          firestoreDisabledRef.current = true;
        }
      }
    }
  };

  const removeFromLibrary = async (movieId) => {
    const user = auth.currentUser;
    const id = Number(movieId);

    if (!Number.isFinite(id)) return;

    if (!user) throw createLoginRequiredError();

    const next = readLocalLibrary().filter((item) => item !== id);
    writeLocalLibrary(next);
    setLibrary(next);

    if (!firestoreDisabledRef.current) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, { library: arrayRemove(id) }, { merge: true });
      } catch (error) {
        console.error('[useLibrary] Firestore remove sync failed:', error);
        if (shouldDisableFirestore(error)) {
          firestoreDisabledRef.current = true;
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
