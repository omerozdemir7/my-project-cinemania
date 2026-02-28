const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let appPromise = null;
let authModulePromise = null;
let firestoreModulePromise = null;
let authPromise = null;
let dbPromise = null;

async function getFirebaseApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp }) =>
      initializeApp(firebaseConfig),
    );
  }

  return appPromise;
}

export async function getFirebaseAuthModule() {
  if (!authModulePromise) {
    authModulePromise = import('firebase/auth');
  }

  return authModulePromise;
}

export async function getFirebaseFirestoreModule() {
  if (!firestoreModulePromise) {
    firestoreModulePromise = import('firebase/firestore');
  }

  return firestoreModulePromise;
}

export async function getFirebaseAuth() {
  if (!authPromise) {
    authPromise = Promise.all([getFirebaseApp(), getFirebaseAuthModule()]).then(
      ([app, { getAuth }]) => getAuth(app),
    );
  }

  return authPromise;
}

export async function getFirebaseDb() {
  if (!dbPromise) {
    dbPromise = Promise.all([
      getFirebaseApp(),
      getFirebaseFirestoreModule(),
    ]).then(([app, { getFirestore }]) => getFirestore(app));
  }

  return dbPromise;
}
