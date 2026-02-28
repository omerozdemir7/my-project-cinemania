import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieProviders,
  fetchMovieReviews,
  fetchMovieVideos,
  getImageUrl,
  getOriginalImageUrl,
} from '../utils/moviesApi';
import { useLibrary } from '../hooks/useLibrary';
import { useAuth } from '../hooks/useAuth';

const COMMENTS_STORAGE_PREFIX = 'movieComments';
const CAST_LIMIT = 12;
const REVIEW_LIMIT = 4;
const WATCH_TERMS = {
  tr: 'izle',
  en: 'watch',
  fr: 'regarder',
  de: 'anschauen',
  es: 'ver',
  it: 'guarda',
  pt: 'assistir',
  ru: 'смотреть',
  ar: 'شاهد',
  fa: 'تماشا',
  zh: '观看',
  ja: '見る',
  ko: '보기',
};

function getCommentsStorageKey(movieId) {
  return `${COMMENTS_STORAGE_PREFIX}:${movieId}`;
}

function getCurrentLanguageCode() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match?.[1]) {
    const raw = decodeURIComponent(match[1]);
    const parts = raw.split('/').filter(Boolean);
    const langFromCookie = parts[parts.length - 1];
    if (langFromCookie) return langFromCookie.toLowerCase();
  }

  const htmlLang = document.documentElement.lang || navigator.language || 'en';
  return htmlLang.toLowerCase();
}

function getWatchTermForLanguage(langCode) {
  if (!langCode) return WATCH_TERMS.en;
  const base = langCode.split('-')[0];
  return WATCH_TERMS[langCode] || WATCH_TERMS[base] || WATCH_TERMS.en;
}

function formatMoney(value) {
  if (!value || !Number.isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getProviderSearchUrl(providerName, movieTitle, fallbackUrl = '') {
  const titleEncoded = encodeURIComponent(movieTitle);
  const pName = providerName.toLowerCase();

  if (pName.includes('netflix')) {
    return `https://www.netflix.com/search?q=${titleEncoded}`;
  }

  if (pName.includes('amazon') || pName.includes('prime')) {
    return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${titleEncoded}`;
  }

  if (pName.includes('disney')) {
    return `https://www.disneyplus.com/search?q=${titleEncoded}`;
  }

  if (pName.includes('apple')) {
    return `https://tv.apple.com/search?term=${titleEncoded}`;
  }

  if (pName.includes('blutv')) {
    return `https://www.blutv.com/arama?q=${titleEncoded}`;
  }

  if (pName.includes('mubi')) {
    return `https://mubi.com/tr/search/films?query=${titleEncoded}`;
  }

  return fallbackUrl || `https://www.google.com/search?q=${titleEncoded}+watch`;
}

export function MovieDetailsPage({ onWatchTrailer, onRequireLogin }) {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const { user } = useAuth();
  const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [providers, setProviders] = useState(null);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trailerKey, setTrailerKey] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [comments, setComments] = useState([]);

  const numericMovieId = Number(movieId);

  useEffect(() => {
    if (!Number.isFinite(numericMovieId)) {
      setLoading(false);
      setMovie(null);
      return;
    }

    const loadMovieData = async () => {
      setLoading(true);

      try {
        const [movieData, providersData, creditsData, reviewsData, videosData] =
          await Promise.all([
            fetchMovieDetails(numericMovieId),
            fetchMovieProviders(numericMovieId),
            fetchMovieCredits(numericMovieId),
            fetchMovieReviews(numericMovieId),
            fetchMovieVideos(numericMovieId),
          ]);

        setMovie(movieData || null);
        setProviders(providersData || null);
        setCast((creditsData?.cast || []).slice(0, CAST_LIMIT));
        setReviews((reviewsData?.results || []).slice(0, REVIEW_LIMIT));

        const videoList = videosData?.results || [];
        const trailer =
          videoList.find((item) => item.site === 'YouTube' && item.type === 'Trailer') ||
          videoList.find((item) => item.site === 'YouTube' && item.type === 'Teaser');
        setTrailerKey(trailer?.key || '');
      } catch (error) {
        console.error('[MovieDetailsPage] Failed to load movie data:', error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, [numericMovieId]);

  useEffect(() => {
    if (!Number.isFinite(numericMovieId)) return;

    const key = getCommentsStorageKey(numericMovieId);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      setComments(Array.isArray(parsed) ? parsed : []);
    } catch {
      setComments([]);
    }
  }, [numericMovieId]);

  const providerData = useMemo(() => {
    if (!providers?.results) return null;
    return providers.results.TR || providers.results.US || null;
  }, [providers]);

  const providerList = useMemo(() => {
    if (!providerData) return [];

    const merged = [
      ...(providerData.flatrate || []),
      ...(providerData.rent || []),
      ...(providerData.buy || []),
    ];
    const uniqueById = new Map();
    merged.forEach((item) => {
      if (item?.provider_id && !uniqueById.has(item.provider_id)) {
        uniqueById.set(item.provider_id, item);
      }
    });
    return Array.from(uniqueById.values()).slice(0, 12);
  }, [providerData]);

  const handleGoogleSearch = () => {
    if (!movie) return;

    const langCode = getCurrentLanguageCode();
    const langBase = langCode.split('-')[0];
    const watchTerm = getWatchTermForLanguage(langCode);
    const visibleTitle =
      document.querySelector('.movie-details-title')?.textContent?.trim() ||
      movie.title;
    const query = encodeURIComponent(`${visibleTitle} ${watchTerm}`);

    window.open(
      `https://www.google.com/search?q=${query}&hl=${encodeURIComponent(langBase)}`,
      '_blank',
    );
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
      const code = typeof error?.code === 'string' ? error.code : '';

      if (code.includes('login-required')) {
        if (typeof onRequireLogin === 'function') {
          onRequireLogin();
          return;
        }

        alert('Please sign in to manage your library.');
        return;
      }

      alert('Library update failed. Please try again.');
    }
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    if (!Number.isFinite(numericMovieId)) return;

    const trimmed = commentText.trim();
    if (trimmed.length < 3) {
      setCommentError('Comment must be at least 3 characters.');
      return;
    }

    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: user?.email || 'Guest',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextComments = [newComment, ...comments];
    setComments(nextComments);
    setCommentText('');
    setCommentError('');

    try {
      localStorage.setItem(
        getCommentsStorageKey(numericMovieId),
        JSON.stringify(nextComments),
      );
    } catch {
      // ignore storage failures
    }
  };

  if (loading) return <Loader />;

  if (!movie) {
    return (
      <section className="movie-details-empty">
        <div className="container">
          <h1>Movie not found</h1>
          <Link to="/catalog" className="btn btn-primary">
            Back to Catalog
          </Link>
        </div>
      </section>
    );
  }

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  return (
    <div className="movie-details-page">
      <section
        className="movie-details-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.95) 100%), url('${getOriginalImageUrl(movie.backdrop_path || movie.poster_path)}')`,
        }}
      >
        <div className="container movie-details-hero-inner">
          <button
            type="button"
            className="movie-details-back-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <div className="movie-details-hero-grid">
            <div className="movie-details-poster-wrap">
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="movie-details-poster"
              />
            </div>

            <div className="movie-details-main">
              <h1 className="movie-details-title">{movie.title}</h1>
              <p className="movie-details-subtitle">
                {releaseYear} | {movie.runtime || 'N/A'} min |{' '}
                {movie.status || 'Unknown'}
              </p>

              <div className="movie-details-badges">
                <span className="movie-badge">TMDB {movie.vote_average?.toFixed(1) || 'N/A'}</span>
                <span className="movie-badge">{movie.vote_count || 0} votes</span>
                <span className="movie-badge">
                  {movie.original_language?.toUpperCase() || 'N/A'}
                </span>
              </div>

              <p className="movie-details-overview">
                {movie.overview || 'No overview available.'}
              </p>

              <div className="movie-details-actions">
                <button
                  type="button"
                  className={`btn-modal-add ${isInLibrary(movie.id) ? 'btn-remove' : ''}`}
                  onClick={handleLibraryToggle}
                >
                  {isInLibrary(movie.id) ? 'Remove from my library' : 'Add to my library'}
                </button>

                <button
                  type="button"
                  className="btn-modal-google"
                  onClick={handleGoogleSearch}
                >
                  Search on Google
                </button>

                <button
                  type="button"
                  className="btn btn-secondary movie-details-trailer-btn"
                  onClick={() => (trailerKey ? onWatchTrailer?.(trailerKey) : onWatchTrailer?.(null))}
                >
                  Watch Trailer
                </button>
              </div>

              <div className="movie-details-meta-grid">
                <div>
                  <span>Release Date</span>
                  <strong>{formatDate(movie.release_date)}</strong>
                </div>
                <div>
                  <span>Genres</span>
                  <strong>
                    {movie.genres?.length
                      ? movie.genres.map((item) => item.name).join(', ')
                      : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span>Budget</span>
                  <strong>{formatMoney(movie.budget)}</strong>
                </div>
                <div>
                  <span>Revenue</span>
                  <strong>{formatMoney(movie.revenue)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="movie-details-section">
        <div className="container">
          <h2 className="movie-details-section-title">Cast</h2>
          {cast.length === 0 ? (
            <p className="movie-details-fallback">Cast data is not available.</p>
          ) : (
            <div className="movie-cast-grid">
              {cast.map((member) => (
                <article key={member.cast_id || `${member.id}-${member.name}`} className="cast-card">
                  <img
                    src={
                      member.profile_path
                        ? `https://image.tmdb.org/t/p/w300${member.profile_path}`
                        : 'https://via.placeholder.com/300x450?text=No+Photo'
                    }
                    alt={member.name}
                  />
                  <div className="cast-card-body">
                    <h3>{member.name}</h3>
                    <p>{member.character || 'Unknown role'}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="movie-details-section">
        <div className="container">
          <h2 className="movie-details-section-title">Where to Watch</h2>
          {providerList.length === 0 ? (
            <p className="movie-details-fallback">Provider data is not available for this region.</p>
          ) : (
            <>
              <div className="provider-grid">
                {providerList.map((provider) => (
                  <button
                    key={provider.provider_id}
                    type="button"
                    className="provider-card"
                    onClick={() =>
                      window.open(
                        getProviderSearchUrl(
                          provider.provider_name || '',
                          movie.title || '',
                          providerData?.link || '',
                        ),
                        '_blank',
                      )
                    }
                  >
                    <img
                      src={
                        provider.logo_path
                          ? `https://image.tmdb.org/t/p/w300${provider.logo_path}`
                          : 'https://via.placeholder.com/300x300?text=No+Logo'
                      }
                      alt={provider.provider_name}
                    />
                    <span>{provider.provider_name}</span>
                  </button>
                ))}
              </div>

              {providerData?.link && (
                <a
                  href={providerData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-link movie-watch-link"
                >
                  View all provider options
                </a>
              )}
            </>
          )}
        </div>
      </section>

      <section className="movie-details-section">
        <div className="container">
          <h2 className="movie-details-section-title">TMDB Reviews</h2>
          {reviews.length === 0 ? (
            <p className="movie-details-fallback">No reviews available yet.</p>
          ) : (
            <div className="review-list">
              {reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <header>
                    <h3>{review.author || 'Anonymous'}</h3>
                    <time>{formatDate(review.created_at)}</time>
                  </header>
                  <p>{(review.content || '').slice(0, 500) || 'No review text.'}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="movie-details-section movie-comment-section">
        <div className="container">
          <h2 className="movie-details-section-title">Your Comments</h2>

          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <label htmlFor="movie-comment-input">Write a comment</label>
            <textarea
              id="movie-comment-input"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Share your thoughts about this movie..."
              rows={4}
              maxLength={800}
            />
            {commentError && <p className="comment-error">{commentError}</p>}
            <button type="submit" className="btn btn-primary">
              Post Comment
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="movie-details-fallback">No comments yet. Be the first one.</p>
          ) : (
            <div className="comment-list">
              {comments.map((comment) => (
                <article key={comment.id} className="comment-card">
                  <header>
                    <h3>{comment.author}</h3>
                    <time>{formatDate(comment.createdAt)}</time>
                  </header>
                  <p>{comment.text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
