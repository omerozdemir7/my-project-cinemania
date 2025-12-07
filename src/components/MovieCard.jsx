import React from 'react';
import { getImageUrl } from '../utils/moviesApi';
import {
  getGenresText,
  getMovieYear,
  renderStars,
} from '../utils/uiHelpers.jsx';

export function MovieCard({ movie, onClick }) {
  const genreList = movie.genres || movie.genre_ids;
  const year = getMovieYear(movie.release_date);

  return (
    <div
      className="movie-card"
      data-id={movie.id}
      onClick={() => onClick && onClick(movie.id)}
    >
      <img
        src={getImageUrl(movie.poster_path)}
        alt={movie.title}
        className="movie-card-poster"
        loading="lazy"
      />
      <div className="movie-card-overlay">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-genre">
            {getGenresText(genreList)} | {year}
          </span>
          <div className="movie-rating">{renderStars(movie.vote_average)}</div>
        </div>
      </div>
    </div>
  );
}
