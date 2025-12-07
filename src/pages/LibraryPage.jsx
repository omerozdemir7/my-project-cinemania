import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/sections/HeroSection';
import { MovieCard } from '../components/MovieCard';
import { Loader } from '../components/Loader';
import { useLibrary } from '../hooks/useLibrary';
import { fetchMovieDetails } from '../utils/moviesApi';

export function LibraryPage({ onMovieClick, onWatchTrailer }) {
  const { library, loading: libraryLoading } = useLibrary();
  const [loading, setLoading] = useState(true);
  const [heroMovieId, setHeroMovieId] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!libraryLoading) {
      loadLibraryMovies();
    }
  }, [library, libraryLoading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadLibraryMovies = async () => {
    if (!library || library.length === 0) {
      setLoading(false);
      setAllMovies([]);
      setFilteredMovies([]);
      return;
    }

    setLoading(true);

    try {
      const promises = library.map((id) => fetchMovieDetails(id));
      const movies = await Promise.all(promises);
      const validMovies = movies.filter((m) => m !== null);

      setAllMovies(validMovies);
      setFilteredMovies(validMovies);

      if (validMovies.length > 0) {
        setHeroMovieId(validMovies[0].id);
        extractGenres(validMovies);
      }
    } catch (error) {
      console.error('Kütüphane yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractGenres = (movies) => {
    const genresMap = new Map();

    movies.forEach((movie) => {
      if (movie && movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((g) => {
          if (g && g.id && g.name) {
            genresMap.set(g.id, g.name);
          }
        });
      }
    });

    const genresList = Array.from(genresMap, ([id, name]) => ({ id, name }));
    setGenres(genresList);
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setIsDropdownOpen(false);

    if (genreId === 'all') {
      setFilteredMovies(allMovies);
    } else {
      const filtered = allMovies.filter(
        (movie) =>
          movie.genres &&
          Array.isArray(movie.genres) &&
          movie.genres.some((g) => g.id.toString() === genreId.toString()),
      );
      setFilteredMovies(filtered);
    }
  };

  const handleCardClick = (movieId) => {
    setHeroMovieId(movieId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSelectedGenreName = () => {
    if (selectedGenre === 'all') return 'Genre';
    const genre = genres.find(
      (g) => g.id.toString() === selectedGenre.toString(),
    );
    return genre ? genre.name : 'Genre';
  };

  if (loading || libraryLoading) return <Loader />;

  return (
    <>
      <HeroSection
        movieId={heroMovieId}
        onWatchTrailer={onWatchTrailer}
        onMoreDetails={onMovieClick}
      >
        {allMovies.length === 0 && <h1>Your Library is Empty</h1>}
      </HeroSection>

      <section className="library-content-section">
        <div className="container">
          {allMovies.length === 0 ? (
            <div className="empty-library">
              <p>OOPS...</p>
              <p>You haven't added any movies yet.</p>
              <Link
                to="/catalog"
                className="btn-modal-add"
                style={{
                  display: 'inline-block',
                  marginTop: '20px',
                  textDecoration: 'none',
                }}
              >
                Go to Catalog
              </Link>
            </div>
          ) : (
            <>
              <div
                className={`genre-filter-container ${isDropdownOpen ? 'is-open' : ''}`}
                ref={dropdownRef}
              >
                <div
                  className="genre-header"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                >
                  <span>{getSelectedGenreName()}</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
                <div
                  className={`genre-list ${isDropdownOpen ? '' : 'is-hidden'}`}
                >
                  <div
                    className={`genre-item ${selectedGenre === 'all' ? 'active' : ''}`}
                    onClick={() => handleGenreChange('all')}
                  >
                    All Genres
                  </div>
                  {genres.map((genre) => (
                    <div
                      key={genre.id}
                      className={`genre-item ${selectedGenre === genre.id.toString() ? 'active' : ''}`}
                      onClick={() => handleGenreChange(genre.id.toString())}
                    >
                      {genre.name}
                    </div>
                  ))}
                </div>
              </div>

              {filteredMovies.length === 0 ? (
                <p
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    gridColumn: '1/-1',
                  }}
                >
                  No movies found for this genre.
                </p>
              ) : (
                <div className="movie-grid-container">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
