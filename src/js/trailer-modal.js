import { fetchMovieVideos } from './movies-data.js';

export function openTrailerModal(videoKey) {
  const backdrop = document.getElementById('trailer-modal-backdrop');
  if (!backdrop) return;

  const iframe = document.getElementById('trailer-iframe');
  const closeBtn = document.getElementById('trailer-modal-close-btn');

  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&showinfo=0`;
  }

  backdrop.classList.remove('is-hidden');
  document.body.classList.add('modal-open');

  if (closeBtn) closeBtn.onclick = () => closeTrailerModal();
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeTrailerModal();
  };

  const onEsc = (e) => {
    if (e.key === 'Escape') {
      closeTrailerModal();
      window.removeEventListener('keydown', onEsc);
    }
  };
  window.addEventListener('keydown', onEsc);
}

export function closeTrailerModal() {
  const backdrop = document.getElementById('trailer-modal-backdrop');
  const iframe = document.getElementById('trailer-iframe');
  if (!backdrop) return;

  backdrop.classList.add('is-hidden');
  document.body.classList.remove('modal-open');
  if (iframe) iframe.src = '';
}

export async function onWatchTrailerClick(movieId) {
  try {
    const data = await fetchMovieVideos(movieId);

    let trailer = data?.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube',
    );

    if (!trailer) {
      trailer = data?.results?.find(
        (v) => v.type === 'Teaser' && v.site === 'YouTube',
      );
    }

    if (trailer && trailer.key) {
      openTrailerModal(trailer.key);
    } else {
      openTrailerErrorModal();
    }
  } catch (error) {
    console.error('Fragman aranırken hata:', error);
    openTrailerErrorModal();
  }
}

export function openTrailerErrorModal() {
  const backdrop = document.getElementById('trailer-error-backdrop');
  if (!backdrop) return;

  const closeBtn = document.getElementById('trailer-error-close-btn');
  backdrop.classList.remove('is-hidden');
  document.body.classList.add('modal-open');

  const closeErrorModal = () => {
    backdrop.classList.add('is-hidden');
    document.body.classList.remove('modal-open');
  };

  if (closeBtn) closeBtn.onclick = closeErrorModal;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeErrorModal();
  };

  const onEsc = (e) => {
    if (e.key === 'Escape') {
      closeErrorModal();
      window.removeEventListener('keydown', onEsc);
    }
  };
  window.addEventListener('keydown', onEsc);
}
