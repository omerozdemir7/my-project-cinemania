// src/js/auth.js

// Firebase kütüphanelerini CDN üzerinden import ediyoruz (Tarayıcı uyumlu)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- SENİN FIREBASE AYARLARIN ---
const firebaseConfig = {
  apiKey: "AIzaSyBmuibsjXBem9CN6pB-0nye7NryFJSya2g",
  authDomain: "filmorex.firebaseapp.com",
  projectId: "filmorex",
  storageBucket: "filmorex.firebasestorage.app",
  messagingSenderId: "962389606250",
  appId: "1:962389606250:web:4ba4c4fd8d70b077e56f13",
  measurementId: "G-XYT7Y5H7G9"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // auth servisi
const db = getFirestore(app);     // veritabanı servisi

// --- DOM ELEMENTLERİ ---
const loginBtn = document.getElementById('btn-login');
const logoutBtn = document.getElementById('btn-logout');
const userEmailSpan = document.getElementById('user-email');
const modalBackdrop = document.getElementById('auth-modal-backdrop');
const closeBtn = document.getElementById('auth-close-btn');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('auth-email');
const passInput = document.getElementById('auth-password');
const authTitle = document.getElementById('auth-title');
const submitBtn = document.getElementById('auth-submit-btn');
const switchBtn = document.getElementById('auth-switch-btn');

let isLoginMode = true;

// --- VERİTABANI İŞLEMLERİ ---

// 1. Kullanıcının Kütüphanesini Getir
export async function getUserLibrary() {
  const user = auth.currentUser;
  
  if (user) {
    // Giriş yapmışsa Firebase'den çek
    const userRef = doc(db, "users", user.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data().library || [];
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
    return [];
  } else {
    // Giriş yapmamışsa LocalStorage'dan çek
    return JSON.parse(localStorage.getItem('myLibrary')) || [];
  }
}

// 2. Kütüphaneye Ekle
export async function addToLibrary(movieId) {
  const user = auth.currentUser;
  const id = Number(movieId);

  if (user) {
    const userRef = doc(db, "users", user.uid);
    // Eğer döküman yoksa oluşturur (merge: true), varsa listeye ekler (arrayUnion)
    await setDoc(userRef, { library: arrayUnion(id) }, { merge: true });
  } else {
    const list = JSON.parse(localStorage.getItem('myLibrary')) || [];
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem('myLibrary', JSON.stringify(list));
    }
  }
}

// 3. Kütüphaneden Çıkar
export async function removeFromLibrary(movieId) {
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
}

// --- AUTH MODAL OLAYLARI ---

if (loginBtn) loginBtn.onclick = () => modalBackdrop.classList.remove('is-hidden');
if (closeBtn) closeBtn.onclick = () => modalBackdrop.classList.add('is-hidden');

if (modalBackdrop) {
  modalBackdrop.onclick = (e) => {
    if(e.target === modalBackdrop) modalBackdrop.classList.add('is-hidden');
  }
}

if (switchBtn) {
  switchBtn.onclick = () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      authTitle.textContent = "Login";
      submitBtn.textContent = "Sign In";
      switchBtn.parentElement.innerHTML = `Don't have an account? <span id="auth-switch-btn" style="color:orange;cursor:pointer">Register here</span>`;
    } else {
      authTitle.textContent = "Register";
      submitBtn.textContent = "Sign Up";
      switchBtn.parentElement.innerHTML = `Already have an account? <span id="auth-switch-btn" style="color:orange;cursor:pointer">Login here</span>`;
    }
    document.getElementById('auth-switch-btn').onclick = switchBtn.onclick; 
  };
}

if (authForm) {
  authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passInput.value;
    
    // Butonu kilitle
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait...";

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      modalBackdrop.classList.add('is-hidden');
      authForm.reset();
    } catch (error) {
      alert("Hata: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLoginMode ? "Sign In" : "Sign Up";
    }
  };
}

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.reload(); // Çıkış yapınca sayfayı yenile
  };
}

// Kullanıcı Durumunu Takip Et
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.classList.add('is-hidden');
    logoutBtn.classList.remove('is-hidden');
    if (userEmailSpan) userEmailSpan.textContent = user.email;
  } else {
    loginBtn.classList.remove('is-hidden');
    logoutBtn.classList.add('is-hidden');
    if (userEmailSpan) userEmailSpan.textContent = '';
  }
});