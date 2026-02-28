import { useEffect, useRef, useState } from 'react';
import { getFirebaseAuth, getFirebaseAuthModule } from '../utils/firebase';

export function useAuth(options = {}) {
  const { enabled = true } = options;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authRef = useRef(null);
  const authModuleRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return () => {};
    }

    let isMounted = true;
    let unsubscribe = () => {};

    const initAuthState = async () => {
      try {
        const [auth, authModule] = await Promise.all([
          getFirebaseAuth(),
          getFirebaseAuthModule(),
        ]);

        if (!isMounted) return;

        authRef.current = auth;
        authModuleRef.current = authModule;

        unsubscribe = authModule.onAuthStateChanged(auth, (nextUser) => {
          if (!isMounted) return;
          setUser(nextUser);
          setLoading(false);
        });
      } catch (error) {
        console.error('[useAuth] Firebase auth init failed:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuthState();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [enabled]);

  const withAuth = async (callback) => {
    const auth = authRef.current || (await getFirebaseAuth());
    const authModule = authModuleRef.current || (await getFirebaseAuthModule());

    authRef.current = auth;
    authModuleRef.current = authModule;

    return callback(auth, authModule);
  };

  const register = async (email, password) => {
    return withAuth((auth, authModule) =>
      authModule.createUserWithEmailAndPassword(auth, email, password),
    );
  };

  const login = async (email, password) => {
    return withAuth((auth, authModule) =>
      authModule.signInWithEmailAndPassword(auth, email, password),
    );
  };

  const logout = async () => {
    return withAuth((auth, authModule) => authModule.signOut(auth));
  };

  const resetPassword = async (email) => {
    return withAuth((auth, authModule) =>
      authModule.sendPasswordResetEmail(auth, email),
    );
  };

  return { user, loading, register, login, logout, resetPassword };
}
