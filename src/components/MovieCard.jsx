import React from 'react';
import { getImageUrl, getPosterSrcSet } from '../utils/moviesApi';
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
        src={getImageUrl(movie.poster_path, 'w500')}
        srcSet={getPosterSrcSet(movie.poster_path)}
        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
        alt={movie.title}
        className="movie-card-poster"
        loading="lazy"
        decoding="async"
        width="342"
        height="513"
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
