import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/sections/HeroSection';
import { MovieCard } from '../components/MovieCard';
import {
  fetchTrendingMovies,
  fetchUpcomingMovies,
  getImageUrl,
  getPosterSrcSet,
} from '../utils/moviesApi';

export function HomePage({ onMovieClick, onWatchTrailer }) {
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [upcomingMovie, setUpcomingMovie] = useState(null);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    setIsUpcomingLoading(true);

    try {
      const dayTrendsPromise = fetchTrendingMovies('day');
      const weekTrendsPromise = fetchTrendingMovies('week');
      const upcomingPromise = fetchUpcomingMovies();

      const [dayTrends, weekTrends] = await Promise.all([
        dayTrendsPromise,
        weekTrendsPromise,
      ]);

      let selectedHeroMovie = null;
      if (dayTrends?.results?.length) {
        const rand = Math.floor(
          Math.random() * Math.min(5, dayTrends.results.length),
        );
        selectedHeroMovie = dayTrends.results[rand];
      } else if (weekTrends?.results?.length) {
        selectedHeroMovie = weekTrends.results[0];
      }

      if (selectedHeroMovie) {
        setHeroMovie(selectedHeroMovie);
      }

      if (weekTrends?.results?.length) {
        setWeeklyTrends(weekTrends.results.slice(0, 3));
      }

      setLoading(false);

      const upcomingData = await upcomingPromise;
      if (upcomingData?.results?.length) {
        const rand = Math.floor(
          Math.random() * Math.min(10, upcomingData.results.length),
        );
        setUpcomingMovie(upcomingData.results[rand]);
      }
      setIsUpcomingLoading(false);
    } catch (error) {
      console.error('[HomePage] Failed to load home data:', error);
      setIsUpcomingLoading(false);
      setLoading(false);
    }
  };

  const handleCardClick = (movieId) => {
    const selectedMovie = weeklyTrends.find((movie) => movie.id === movieId);
    if (selectedMovie) {
      setHeroMovie(selectedMovie);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <HeroSection
        movie={heroMovie}
        onWatchTrailer={onWatchTrailer}
        onMoreDetails={onMovieClick}
      />

      <section className="weekly-trends-section">
        <div className="container">
          <div className="section-header">
            <h2>WEEKLY TRENDS</h2>
            <Link to="/catalog" className="see-all-link">
              See all
            </Link>
          </div>
          <div className="movie-grid-container">
            {loading && weeklyTrends.length === 0
              ? [1, 2, 3].map((key) => (
                  <div key={key} className="movie-card movie-card-skeleton"></div>
                ))
              : weeklyTrends.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={handleCardClick}
                  />
                ))}
          </div>
        </div>
      </section>

      <section className="upcoming-section upcoming-section-stable">
        <div className="container">
          <h2>UPCOMING THIS MONTH</h2>
          <div className={`upcoming-container ${isUpcomingLoading ? 'is-loading' : ''}`}>
            {upcomingMovie ? (
              <>
                <div className="upcoming-image">
                  <img
                    src={getImageUrl(upcomingMovie.poster_path, 'w500')}
                    srcSet={getPosterSrcSet(upcomingMovie.poster_path)}
                    sizes="(max-width: 768px) 45vw, 340px"
                    alt={upcomingMovie.title}
                    width="340"
                    height="510"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="upcoming-info">
                  <h3>{upcomingMovie.title}</h3>
                  <div className="movie-details-list">
                    <div className="detail-item">
                      <span className="detail-key">Release Date</span>
                      <span className="detail-value">
                        {new Date(upcomingMovie.release_date).toLocaleDateString(
                          'en-US',
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Vote</span>
                      <span className="detail-value">
                        {upcomingMovie.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Vote Count</span>
                      <span className="detail-value">
                        {upcomingMovie.vote_count}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-key">Popularity</span>
                      <span className="detail-value">
                        {upcomingMovie.popularity.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <h4 className="upcoming-about-title">ABOUT</h4>
                  <p className="upcoming-description">
                    {upcomingMovie.overview || 'No description available.'}
                  </p>
                  <button
                    className="btn btn-primary upcoming-btn"
                    onClick={() => onMovieClick(upcomingMovie.id)}
                  >
                    More details
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="upcoming-image upcoming-skeleton-block"></div>
                <div className="upcoming-info upcoming-skeleton-info">
                  <div className="upcoming-skeleton-line upcoming-skeleton-title"></div>
                  <div className="upcoming-skeleton-line"></div>
                  <div className="upcoming-skeleton-line"></div>
                  <div className="upcoming-skeleton-line"></div>
                  <div className="upcoming-skeleton-line upcoming-skeleton-text"></div>
                  <div className="upcoming-skeleton-btn"></div>
                </div>
              </>
            )}
          </div>

          {!isUpcomingLoading && !upcomingMovie && (
            <div className="upcoming-empty-state">
              <p>Upcoming movie data is temporarily unavailable.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
