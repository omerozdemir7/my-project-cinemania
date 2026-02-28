import React, { useState, useEffect } from 'react';
import {
  fetchMovieDetails,
  fetchMovieVideos,
  getBackdropUrl,
  getBackdropSrcSet,
} from '../../utils/moviesApi';

export function HeroSection({
  movieId,
  movie: movieProp,
  onWatchTrailer,
  onMoreDetails,
  children,
}) {
  const [movie, setMovie] = useState(movieProp || null);

  useEffect(() => {
    if (movieProp) {
      setMovie(movieProp);
      return;
    }

    if (!movieId) {
      setMovie(null);
      return;
    }

    let ignore = false;

    const loadMovie = async () => {
      const movieData = await fetchMovieDetails(movieId);
      if (!ignore) {
        setMovie(movieData || null);
      }
    };

    loadMovie();

    return () => {
      ignore = true;
    };
  }, [movieId, movieProp]);

  const handleWatchTrailer = async () => {
    if (!movie) return;

    try {
      const videos = await fetchMovieVideos(movie.id);
      let trailer = videos?.results?.find(
        (v) => v.type === 'Trailer' && v.site === 'YouTube',
      );

      if (!trailer) {
        trailer = videos?.results?.find(
          (v) => v.type === 'Teaser' && v.site === 'YouTube',
        );
      }

      if (trailer && trailer.key) {
        onWatchTrailer(trailer.key);
      } else {
        onWatchTrailer(null);
      }
    } catch (err) {
      console.error(err);
      onWatchTrailer(null);
    }
  };

  const renderStars = (vote) => {
    const stars = Math.round((vote || 0) / 2);
    const starElements = [];
    for (let i = 1; i <= 5; i++) {
      starElements.push(
        <i
          key={i}
          className={`fa-star ${i <= stars ? 'fas active' : 'far'}`}
        ></i>,
      );
    }
    return starElements;
  };

  const backdropPath = movie?.backdrop_path || movie?.poster_path;
  const heroImageSrc = getBackdropUrl(backdropPath, 'w780');
  const heroImageSrcSet = getBackdropSrcSet(backdropPath, ['w780', 'w1280']);

  const renderHeroMedia = () => {
    if (!backdropPath) return null;

    return (
      <div className="hero-media" aria-hidden="true">
        <img
          src={heroImageSrc}
          srcSet={heroImageSrcSet || undefined}
          sizes="100vw"
          alt=""
          className="hero-bg-image"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay"></div>
      </div>
    );
  };

  if (children) {
    return (
      <section className="hero-section">
        {renderHeroMedia()}
        <div className="container hero-container">
          <div className="hero-content">{children}</div>
        </div>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Loading...</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      {renderHeroMedia()}
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">{movie.title}</h1>
          <div className="star-rating hero-stars">
            {renderStars(movie.vote_average)}
          </div>
          <p className="hero-description">
            {movie.overview || 'No description available.'}
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleWatchTrailer}>
              Watch Trailer
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onMoreDetails(movie.id)}
            >
              More details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
