import {
  fetchMovieDetails,
  getImageUrl,
  fetchMovieProviders,
} from './movies-data.js';
import { getUserLibrary, addToLibrary, removeFromLibrary } from './auth.js';

export function setupModal() {
  const backdrop = document.querySelector('#movie-modal-backdrop');
  if (!backdrop) return { openModal: () => {}, closeModal: () => {} };

  const closeBtn = backdrop.querySelector('#modal-close-btn');
  const poster = backdrop.querySelector('#modal-poster');
  const title = backdrop.querySelector('#modal-title');
  const voteAvg = backdrop.querySelector('#modal-vote-avg');
  const voteCount = backdrop.querySelector('#modal-vote-count');
  const popularity = backdrop.querySelector('#modal-popularity');
  const genre = backdrop.querySelector('#modal-genre');
  const description = backdrop.querySelector('#modal-description');
  const addBtn = backdrop.querySelector('#modal-add-btn');

  const providersContainer = backdrop.querySelector(
    '#modal-providers-container',
  );
  const providersList = backdrop.querySelector('#modal-providers-list');
  const watchLink = backdrop.querySelector('#modal-watch-link');
  const googleBtn = backdrop.querySelector('#modal-google-btn');

  async function openModal(movieId) {
    const movie = await fetchMovieDetails(movieId);
    if (!movie) return;

    if (googleBtn) {
      googleBtn.onclick = () => {
        const query = encodeURIComponent(`${movie.title} izle`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
      };
    }

    const providersData = await fetchMovieProviders(movieId);

    if (poster) poster.src = getImageUrl(movie.poster_path);
    if (title) title.textContent = movie.title.toUpperCase();
    if (voteAvg) voteAvg.textContent = movie.vote_average.toFixed(1);
    if (voteCount) voteCount.textContent = movie.vote_count;
    if (popularity) popularity.textContent = movie.popularity.toFixed(1);
    if (genre)
      genre.textContent = movie.genres.map((g) => g.name).join(', ') || 'N/A';
    if (description)
      description.textContent = movie.overview || 'No description available.';

    if (providersContainer && providersList) {
      providersList.innerHTML = '';
      providersContainer.classList.add('is-hidden');

      const trData = providersData?.results?.TR;

      if (trData && trData.flatrate && trData.flatrate.length > 0) {
        providersContainer.classList.remove('is-hidden');

        if (watchLink) watchLink.href = trData.link;

        trData.flatrate.slice(0, 5).forEach((provider) => {
          const img = document.createElement('img');
          img.src = `https://image.tmdb.org/t/p/w154${provider.logo_path}`;
          img.alt = provider.provider_name;
          img.title = `Watch on ${provider.provider_name}`;
          img.classList.add('provider-logo');

          img.onclick = () => {
            const titleEncoded = encodeURIComponent(movie.title);
            const pName = provider.provider_name.toLowerCase();
            let targetUrl = '';

            if (pName.includes('netflix')) {
              targetUrl = `https://www.netflix.com/search?q=${titleEncoded}`;
            } else if (pName.includes('amazon') || pName.includes('prime')) {
              targetUrl = `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${titleEncoded}`;
            } else if (pName.includes('disney')) {
              targetUrl = `https://www.disneyplus.com/search?q=${titleEncoded}`;
            } else if (pName.includes('apple')) {
              targetUrl = `https://tv.apple.com/search?term=${titleEncoded}`;
            } else if (pName.includes('blutv')) {
              targetUrl = `https://www.blutv.com/arama?q=${titleEncoded}`;
            } else if (pName.includes('mubi')) {
              targetUrl = `https://mubi.com/tr/search/films?query=${titleEncoded}`;
            } else {
              targetUrl = trData.link;
            }
            window.open(targetUrl, '_blank');
          };
          providersList.appendChild(img);
        });
      }
    }

    if (addBtn) {
      const numericMovieId = Number(movie.id);
      addBtn.dataset.id = numericMovieId;

      addBtn.textContent = 'Checking...';
      addBtn.disabled = true;
      addBtn.classList.remove('btn-remove');

      getUserLibrary().then((library) => {
        const exists = library.includes(numericMovieId);

        if (exists) {
          addBtn.textContent = 'Remove from my library';
          addBtn.classList.add('btn-remove');
        } else {
          addBtn.textContent = 'Add to my library';
          addBtn.classList.remove('btn-remove');
        }
        addBtn.disabled = false;
      });
    }

    backdrop.classList.remove('is-hidden');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    backdrop.classList.add('is-hidden');
    document.body.classList.remove('modal-open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.classList.contains('is-hidden'))
      closeModal();
  });

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const id = Number(addBtn.dataset.id);
      if (!id) return;

      addBtn.disabled = true;
      const originalText = addBtn.textContent;
      addBtn.textContent = 'Processing...';

      try {
        const library = await getUserLibrary();
        const exists = library.includes(id);

        if (exists) {
          await removeFromLibrary(id);
          addBtn.textContent = 'Add to my library';
          addBtn.classList.remove('btn-remove');
        } else {
          await addToLibrary(id);
          addBtn.textContent = 'Remove from my library';
          addBtn.classList.add('btn-remove');
        }
      } catch (err) {
        console.error('Library Error:', err);
        addBtn.textContent = originalText;
        alert('Bir hata oluştu. Giriş yapmamış olabilir misiniz?');
      } finally {
        addBtn.disabled = false;
      }
    });
  }

  return { openModal, closeModal };
}
