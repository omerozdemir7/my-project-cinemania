import { searchMovies, fetchPopularMovies } from './movies-data.js';
import { setupPagination } from './pagination.js';
import { showLoader, hideLoader } from './loader.js';
import { renderMovieCard, updateHeroWithMovie } from './ui-helpers.js';

const initCatalog = async () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const movieGrid = document.getElementById('movie-grid');
  const paginationContainer = document.querySelector('.pagination');
  const heroSection = document.getElementById('catalog-hero');
  const heroContent = document.getElementById('catalog-hero-content');

  const dropdown = document.getElementById('year-dropdown');
  const dropdownHeader = document.getElementById('dropdown-header');
  const dropdownList = document.getElementById('dropdown-list');
  const selectedYearSpan = document.getElementById('selected-year');
  const yearInput = document.getElementById('year-input');

  if (!movieGrid) return;

  const currentYear = new Date().getFullYear();

  if (dropdownList) {
    const resetLi = document.createElement('li');
    resetLi.classList.add('dropdown-item');
    resetLi.textContent = 'Year';

    resetLi.onclick = () => {
      if (yearInput) yearInput.value = '';
      if (selectedYearSpan) {
        selectedYearSpan.textContent = 'Year';
        selectedYearSpan.style.color = '';
      }
      closeDropdown();
    };
    dropdownList.appendChild(resetLi);

    for (let y = currentYear; y >= 1950; y--) {
      const li = document.createElement('li');
      li.classList.add('dropdown-item');
      li.textContent = y;

      li.onclick = () => {
        if (yearInput) yearInput.value = y;
        if (selectedYearSpan) {
          selectedYearSpan.textContent = y;
          selectedYearSpan.style.color = 'var(--primary-orange)';
        }
        closeDropdown();
      };

      dropdownList.appendChild(li);
    }
  }

  function toggleDropdown() {
    if (dropdown) dropdown.classList.toggle('active');
    if (dropdownList) dropdownList.classList.toggle('is-hidden');
  }

  function closeDropdown() {
    if (dropdown) dropdown.classList.remove('active');
    if (dropdownList) dropdownList.classList.add('is-hidden');
  }

  if (dropdownHeader) {
    dropdownHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  let currentPage = 1;
  let lastQuery = '';
  let lastYear = '';
  let totalPages = 1;

  async function loadInitialMovies() {
    showLoader();
    const data = await fetchPopularMovies(1);
    hideLoader();

    if (data?.results?.length) {
      renderMovies(data.results);
      if (data.results[0]) {
        await updateHeroWithMovie(data.results[0].id, heroSection, heroContent);
      }
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = input.value.trim();

      const year = yearInput ? yearInput.value : '';

      if (!query) return;

      currentPage = 1;
      lastQuery = query;
      lastYear = year;

      closeDropdown();

      await fetchAndRenderMovies(query, year, currentPage);
    });
  }

  async function fetchAndRenderMovies(query, year, page) {
    showLoader();
    const data = await searchMovies(query, page, year);
    hideLoader();

    if (!data?.results?.length) {
      movieGrid.innerHTML = `
        <div class="no-results-container">
          <h2 class="no-results-title">OOPS...</h2>
          <h3 class="no-results-text">We are very sorry!</h3>
          <h3 class="no-results-text">We don’t have any results matching your search.</h3>
        </div>
      `;
      paginationContainer.innerHTML = '';
      heroContent.innerHTML = '';
      heroSection.style.backgroundImage = 'none';
      return;
    }
    totalPages = data.total_pages;
    renderMovies(data.results);

    if (data.results[0]) {
      await updateHeroWithMovie(data.results[0].id, heroSection, heroContent);
    }

    setupPagination(paginationContainer, totalPages, page, (newPage) => {
      currentPage = newPage;
      fetchAndRenderMovies(lastQuery, lastYear, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function renderMovies(list) {
    movieGrid.innerHTML = list.map((m) => renderMovieCard(m)).join('');
  }

  movieGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.movie-card');
    if (card && card.dataset.id) {
      updateHeroWithMovie(card.dataset.id, heroSection, heroContent);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  await loadInitialMovies();
};

initCatalog();
