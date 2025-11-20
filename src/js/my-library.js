// src/js/my-library.js

import { getUserLibrary, auth } from './auth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { fetchMovieDetails } from './movies-data.js';
import { renderMovieCard, updateHeroWithMovie } from './ui-helpers.js';
import { showLoader, hideLoader } from './loader.js';

const initLibrary = () => {
  const libraryGrid = document.getElementById('library-grid');
  const heroSection = document.getElementById('library-hero');
  const heroContent = document.getElementById('library-hero-content');
  
  // Boş mesaj elementi yoksa JS ile oluşturup ekleyelim
  let emptyMsg = document.getElementById('empty-library-msg');
  if (!emptyMsg && libraryGrid) {
    emptyMsg = document.createElement('div');
    emptyMsg.id = 'empty-library-msg';
    emptyMsg.className = 'empty-library is-hidden';
    emptyMsg.innerHTML = `
      <p>OOPS...</p>
      <p>You haven't added any movies yet.</p>
      <a href="catalog.html" style="color:var(--primary-orange, orange); margin-top:15px; display:inline-block;">Go to Catalog</a>
    `;
    // Grid'in hemen öncesine ekle
    libraryGrid.parentNode.insertBefore(emptyMsg, libraryGrid);
  }

  if (!libraryGrid) return;

  // --- LİSTEYİ YÜKLEME FONKSİYONU ---
  async function loadLibraryMovies() {
    showLoader();
    libraryGrid.innerHTML = ''; // Temizle
    if (emptyMsg) emptyMsg.classList.add('is-hidden');

    try {
      // 1. Film ID'lerini çek (Firebase veya LocalStorage)
      const movieIds = await getUserLibrary();

      // 2. Eğer liste boşsa
      if (!movieIds || movieIds.length === 0) {
        hideLoader();
        if (emptyMsg) emptyMsg.classList.remove('is-hidden');
        if (heroSection) heroSection.style.backgroundImage = 'none';
        if (heroContent) heroContent.innerHTML = '<h1>Your Library is Empty</h1>';
        return;
      }

      // 3. ID'leri kullanarak film detaylarını API'den çek
      const promises = movieIds.map(id => fetchMovieDetails(id));
      const movies = await Promise.all(promises);

      // 4. Filmleri Ekrana Bas (Hatalı/Silinmiş olanları filtrele)
      const validMovies = movies.filter(m => m !== null);
      
      libraryGrid.innerHTML = validMovies.map(m => renderMovieCard(m)).join('');

      // 5. İlk filmi Hero alanına koy
      if (validMovies.length > 0 && heroSection) {
        updateHeroWithMovie(validMovies[0].id, heroSection, heroContent);
      }

    } catch (error) {
      console.error("Kütüphane yüklenirken hata:", error);
      libraryGrid.innerHTML = '<p style="color:white; text-align:center;">Bir hata oluştu.</p>';
    } finally {
      hideLoader();
    }
  }

  // --- OTURUM DURUMUNU DİNLE ---
  // Sayfa açıldığında Firebase'in durumunu bekliyoruz
  onAuthStateChanged(auth, (user) => {
    loadLibraryMovies();
  });
  
  // Kartlara tıklayınca Hero güncelle
  libraryGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.movie-card');
    if (card && card.dataset.id && heroSection) {
      updateHeroWithMovie(card.dataset.id, heroSection, heroContent);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};

// Başlat
initLibrary();