import React, { useState, useEffect, useRef } from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { MovieCard } from '../components/MovieCard';
import { Pagination } from '../components/Pagination';
import { Loader } from '../components/Loader';
import { searchMovies, fetchPopularMovies } from '../utils/moviesApi';

export function CatalogPage({ onMovieClick, onWatchTrailer }) {
  const [loading, setLoading] = useState(true);
  const [heroMovieId, setHeroMovieId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadInitialMovies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadInitialMovies = async () => {
    setLoading(true);
    const data = await fetchPopularMovies(1);
    setLoading(false);

    if (data?.results?.length) {
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setHeroMovieId(data.results[0].id);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setCurrentPage(1);
    await fetchAndRenderMovies(searchQuery, selectedYear, 1);
  };

  const fetchAndRenderMovies = async (query, year, page) => {
    setLoading(true);
    const data = await searchMovies(query, page, year);
    setLoading(false);

    if (!data?.results?.length) {
      setMovies([]);
      setTotalPages(1);
      return;
    }

    setMovies(data.results);
    setTotalPages(Math.min(data.total_pages, 500));
    if (data.results[0]) {
      setHeroMovieId(data.results[0].id);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (searchQuery) {
      fetchAndRenderMovies(searchQuery, selectedYear, page);
    } else {
      loadPopularPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadPopularPage = async (page) => {
    setLoading(true);
    const data = await fetchPopularMovies(page);
    setLoading(false);

    if (data?.results?.length) {
      setMovies(data.results);
      setTotalPages(data.total_pages);
    }
  };

  const handleCardClick = (movieId) => {
    setHeroMovieId(movieId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1950; y--) {
    years.push(y);
  }

  return (
    <>
      {loading && <Loader />}

      <HeroSection
        movieId={heroMovieId}
        onWatchTrailer={onWatchTrailer}
        onMoreDetails={onMovieClick}
      />

      <section className="search-section">
        <div className="container">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-bar"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div
              className={`custom-dropdown ${isDropdownOpen ? 'active' : ''}`}
              ref={dropdownRef}
            >
              <div
                className="dropdown-header"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                <span
                  style={{ color: selectedYear ? 'var(--primary-orange)' : '' }}
                >
                  {selectedYear || 'Year'}
                </span>
                <i className="fas fa-chevron-down"></i>
              </div>
              <ul
                className={`dropdown-list ${isDropdownOpen ? '' : 'is-hidden'}`}
              >
                <li
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedYear('');
                    setIsDropdownOpen(false);
                  }}
                >
                  Year
                </li>
                {years.map((year) => (
                  <li
                    key={year}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedYear(year.toString());
                      setIsDropdownOpen(false);
                    }}
                  >
                    {year}
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </section>

      <section className="movie-grid-section">
        <div className="container">
          {movies.length === 0 && !loading ? (
            <div className="no-results-container">
              <h2>OOPS!</h2>
              <h3>Search result not successful</h3>
              <p>Enter a different keyword or remove the search filter</p>
            </div>
          ) : (
            <div className="movie-grid-container">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pagination-section">
        <div className="container">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
    </>
  );
}
