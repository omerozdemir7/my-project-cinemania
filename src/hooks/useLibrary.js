// src/hooks/useLibrary.js
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

export function useLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLibrary = async () => {
    setLoading(true);
    const user = auth.currentUser;
    
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setLibrary(docSnap.data().library || []);
        } else {
          setLibrary([]);
        }
      } catch (error) {
        console.error(error);
        setLibrary([]);
      }
    } else {
      const localLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
      setLibrary(localLibrary);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadLibrary();
    
    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadLibrary();
    });

    return unsubscribe;
  }, []);

  const addToLibrary = async (movieId) => {
    const user = auth.currentUser;
    const id = Number(movieId);
    
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { library: arrayUnion(id) }, { merge: true });
    } else {
      const list = JSON.parse(localStorage.getItem('myLibrary')) || [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('myLibrary', JSON.stringify(list));
      }
    }
    
    await loadLibrary();
  };

  const removeFromLibrary = async (movieId) => {
    const user = auth.currentUser;
    const id = Number(movieId);
    
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { library: arrayRemove(id) });
    } else {
      let list = JSON.parse(localStorage.getItem('myLibrary')) || [];
      list = list.filter(item => item !== id);
      localStorage.setItem('myLibrary', JSON.stringify(list));
    }
    
    await loadLibrary();
  };

  const isInLibrary = (movieId) => {
    return library.includes(Number(movieId));
  };

  return { library, loading, addToLibrary, removeFromLibrary, isInLibrary, refreshLibrary: loadLibrary };
}
