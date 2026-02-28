import React, { useState, useEffect } from 'react';
import {
  fetchMovieDetails,
  fetchMovieProviders,
  getImageUrl,
  getProviderLogoUrl,
  getProviderLogoSrcSet,
} from '../../utils/moviesApi';
import { useLibrary } from '../../hooks/useLibrary';

export function MovieDetailsModal({ isOpen, onClose, movieId, onRequireLogin }) {
  const [movie, setMovie] = useState(null);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();

  useEffect(() => {
    if (isOpen && movieId) {
      loadMovieData();
    }
  }, [isOpen, movieId]);

  const loadMovieData = async () => {
    setLoading(true);
    const [movieData, providersData] = await Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieProviders(movieId),
    ]);
    setMovie(movieData);
    setProviders(providersData);
    setLoading(false);
  };

  const handleLibraryToggle = async () => {
    if (!movie) return;

    try {
      if (isInLibrary(movie.id)) {
        await removeFromLibrary(movie.id);
      } else {
        await addToLibrary(movie.id);
      }
    } catch (error) {
      console.error('Library Error:', error);
      const code = typeof error?.code === 'string' ? error.code : '';

      if (code.includes('login-required')) {
        if (typeof onRequireLogin === 'function') {
          onClose();
          onRequireLogin();
          return;
        }

        alert('Kütüphaneye film eklemek için giriş yapmalısınız.');
        return;
      }

      if (code.includes('permission-denied')) {
        alert(
          'Firebase Firestore izinleri kısıtlıyor. Firestore Rules (güvenlik kuralları) kısmını kontrol edin.',
        );
        return;
      }

      if (code.includes('unauthenticated')) {
        alert('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      alert('Kütüphane işlemi sırasında bir hata oluştu.');
    }
  };

  const handleGoogleSearch = () => {
    if (movie) {
      const query = encodeURIComponent(`${movie.title} izle`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !movie) return null;

  const trData = providers?.results?.TR;
  const hasProviders = trData && trData.flatrate && trData.flatrate.length > 0;

  return (
    <div
      className="modal-backdrop"
      id="movie-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-window movie-modal-size">
        <button type="button" className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="modal-content">
          <div className="modal-poster-wrapper">
            <img
              src={getImageUrl(movie.poster_path)}
              alt="Movie Poster"
              className="modal-poster"
              decoding="async"
              width="500"
              height="750"
            />
          </div>

          <div className="modal-info">
            <h2 className="modal-title">{movie.title.toUpperCase()}</h2>

            <div className="modal-details-grid">
              <div className="detail-row">
                <span className="detail-label">Vote / Votes</span>
                <div className="detail-value">
                  <span className="vote-tag">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="slash">/</span>
                  <span className="vote-tag">{movie.vote_count}</span>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">Popularity</span>
                <span className="detail-value">
                  {movie.popularity.toFixed(1)}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Genre</span>
                <span className="detail-value">
                  {movie.genres.map((g) => g.name).join(', ') || 'N/A'}
                </span>
              </div>
            </div>

            <h3 className="modal-about-title">ABOUT</h3>
            <p className="modal-description">
              {movie.overview || 'No description available.'}
            </p>

            {hasProviders && (
              <div
                id="modal-providers-container"
                className="providers-container"
              >
                <h3 className="modal-about-title">WATCH ON</h3>
                <div className="providers-list">
                  {trData.flatrate.slice(0, 5).map((provider, index) => (
                    <img
                      key={index}
                      src={getProviderLogoUrl(provider.logo_path, 'w154')}
                      srcSet={getProviderLogoSrcSet(provider.logo_path, [
                        'w92',
                        'w154',
                        'w300',
                      ])}
                      sizes="72px"
                      alt={provider.provider_name}
                      title={`Watch on ${provider.provider_name}`}
                      className="provider-logo"
                      loading="lazy"
                      decoding="async"
                      onClick={() => {
                        const titleEncoded = encodeURIComponent(movie.title);
                        const pName = provider.provider_name.toLowerCase();
                        let targetUrl = '';

                        if (pName.includes('netflix')) {
                          targetUrl = `https://www.netflix.com/search?q=${titleEncoded}`;
                        } else if (
                          pName.includes('amazon') ||
                          pName.includes('prime')
                        ) {
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
                      }}
                    />
                  ))}
                </div>
                <a
                  href={trData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-link"
                >
                  View all options
                </a>
              </div>
            )}

            <div className="modal-btn-wrapper">
              <button
                type="button"
                className={`btn-modal-add ${isInLibrary(movie.id) ? 'btn-remove' : ''}`}
                onClick={handleLibraryToggle}
              >
                {isInLibrary(movie.id)
                  ? 'Remove from my library'
                  : 'Add to my library'}
              </button>

              <button
                type="button"
                className="btn-modal-google"
                onClick={handleGoogleSearch}
              >
                Search on Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
