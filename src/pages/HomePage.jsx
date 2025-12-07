import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/sections/HeroSection';
import { MovieCard } from '../components/MovieCard';
import { Loader } from '../components/Loader';
import {
  fetchTrendingMovies,
  fetchUpcomingMovies,
  fetchMovieDetails,
  getOriginalImageUrl,
} from '../utils/moviesApi';

export function HomePage({ onMovieClick, onWatchTrailer }) {
  const [loading, setLoading] = useState(true);
  const [heroMovieId, setHeroMovieId] = useState(null);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [upcomingMovie, setUpcomingMovie] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);

    try {
      const [dayTrends, weekTrends, upcomingData] = await Promise.all([
        fetchTrendingMovies('day'),
        fetchTrendingMovies('week'),
        fetchUpcomingMovies(),
      ]);

      let heroMovie = null;
      if (dayTrends?.results?.length) {
        const rand = Math.floor(
          Math.random() * Math.min(5, dayTrends.results.length),
        );
        heroMovie = dayTrends.results[rand];
      } else if (weekTrends?.results?.length) {
        heroMovie = weekTrends.results[0];
      }

      if (heroMovie) {
        setHeroMovieId(heroMovie.id);
      }

      if (weekTrends?.results?.length) {
        setWeeklyTrends(weekTrends.results.slice(0, 3));
      }

      if (upcomingData?.results?.length) {
        const rand = Math.floor(
          Math.random() * Math.min(10, upcomingData.results.length),
        );
        setUpcomingMovie(upcomingData.results[rand]);
      }
    } catch (error) {
      console.error('Anasayfa yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (movieId) => {
    setHeroMovieId(movieId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (loading) return <Loader />;

  return (
    <>
      <HeroSection
        movieId={heroMovieId}
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
            {weeklyTrends.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </section>

      {upcomingMovie && (
        <section className="upcoming-section">
          <div className="container">
            <h2>UPCOMING THIS MONTH</h2>
            <div className="upcoming-container">
              <div className="upcoming-image">
                <img
                  src={getOriginalImageUrl(upcomingMovie.poster_path)}
                  alt={upcomingMovie.title}
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
            </div>
          </div>
        </section>
      )}
    </>
  );
}
