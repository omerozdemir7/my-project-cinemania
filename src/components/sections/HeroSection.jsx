// src/components/sections/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { fetchMovieDetails, fetchMovieVideos, getBackdropUrl } from '../../utils/moviesApi';

export function HeroSection({ movieId, onWatchTrailer, onMoreDetails, children }) {
  const [movie, setMovie] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    if (movieId) {
      loadMovie();
    }
  }, [movieId]);

  const loadMovie = async () => {
    const movieData = await fetchMovieDetails(movieId);
    if (movieData) {
      setMovie(movieData);
      const bg = getBackdropUrl(movieData.backdrop_path || movieData.poster_path);
      setBackgroundImage(`
        linear-gradient(to right, 
          #111 0%, 
          rgba(17, 17, 17, 1) 30%, 
          rgba(17, 17, 17, 0.5) 50%, 
          transparent 100%),
        url('${bg}')
      `);
    }
  };

  const handleWatchTrailer = async () => {
    if (!movie) return;
    
    try {
      const videos = await fetchMovieVideos(movie.id);
      let trailer = videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
      
      if (!trailer) {
        trailer = videos?.results?.find(v => v.type === "Teaser" && v.site === "YouTube");
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
        <i key={i} className={`fa-star ${i <= stars ? "fas active" : "far"}`}></i>
      );
    }
    return starElements;
  };

  if (children) {
    return (
      <section className="hero-section" style={{ backgroundImage }}>
        <div className="container hero-container">
          <div className="hero-content">
            {children}
          </div>
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
    <section className="hero-section" style={{ backgroundImage }}>
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">{movie.title}</h1>
          <div className="star-rating hero-stars">
            {renderStars(movie.vote_average)}
          </div>
          <p className="hero-description">{movie.overview || "No description available."}</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleWatchTrailer}>
              Watch Trailer
            </button>
            <button className="btn btn-secondary" onClick={() => onMoreDetails(movie.id)}>
              More details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
