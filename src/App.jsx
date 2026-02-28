import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Loader } from './components/Loader';
import { HomePage } from './pages/HomePage';

function lazyNamedImport(factory, exportName) {
  return lazy(() =>
    factory().then((module) => ({
      default: module[exportName],
    })),
  );
}

const LoginModal = lazyNamedImport(
  () => import('./components/modals/LoginModal'),
  'LoginModal',
);
const TrailerModal = lazyNamedImport(
  () => import('./components/modals/TrailerModal'),
  'TrailerModal',
);
const TrailerErrorModal = lazyNamedImport(
  () => import('./components/modals/TrailerErrorModal'),
  'TrailerErrorModal',
);
const TeamModal = lazyNamedImport(
  () => import('./components/modals/TeamModal'),
  'TeamModal',
);

const CatalogPage = lazyNamedImport(
  () => import('./pages/CatalogPage'),
  'CatalogPage',
);
const LibraryPage = lazyNamedImport(
  () => import('./pages/LibraryPage'),
  'LibraryPage',
);
const MovieDetailsPage = lazyNamedImport(
  () => import('./pages/MovieDetailsPage'),
  'MovieDetailsPage',
);

function App() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isTrailerErrorModalOpen, setIsTrailerErrorModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [trailerVideoKey, setTrailerVideoKey] = useState(null);

  useEffect(() => {
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const body = document.body;

    if (themeToggle) {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.checked = true;
      }

      const handleThemeChange = () => {
        if (themeToggle.checked) {
          body.classList.add('light-mode');
          localStorage.setItem('theme', 'light');
        } else {
          body.classList.remove('light-mode');
          localStorage.setItem('theme', 'dark');
        }
      };

      themeToggle.addEventListener('change', handleThemeChange);
      return () => themeToggle.removeEventListener('change', handleThemeChange);
    }
  }, []);

  const handleMovieClick = (movieId) => {
    if (!movieId) return;
    navigate(`/movie/${movieId}`);
  };

  const handleWatchTrailer = (videoKey) => {
    if (videoKey) {
      setTrailerVideoKey(videoKey);
      setIsTrailerModalOpen(true);
    } else {
      setIsTrailerErrorModalOpen(true);
    }
  };

  const routeFallback = <Loader />;

  return (
    <div className="App">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onMovieClick={handleMovieClick}
                onWatchTrailer={handleWatchTrailer}
              />
            }
          />
          <Route
            path="/catalog"
            element={
              <Suspense fallback={routeFallback}>
                <CatalogPage
                  onMovieClick={handleMovieClick}
                  onWatchTrailer={handleWatchTrailer}
                />
              </Suspense>
            }
          />
          <Route
            path="/library"
            element={
              <Suspense fallback={routeFallback}>
                <LibraryPage
                  onMovieClick={handleMovieClick}
                  onWatchTrailer={handleWatchTrailer}
                />
              </Suspense>
            }
          />
          <Route
            path="/movie/:movieId"
            element={
              <Suspense fallback={routeFallback}>
                <MovieDetailsPage
                  onWatchTrailer={handleWatchTrailer}
                  onRequireLogin={() => setIsLoginModalOpen(true)}
                />
              </Suspense>
            }
          />
        </Routes>
      </main>

      <Footer onTeamModalOpen={() => setIsTeamModalOpen(true)} />

      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </Suspense>
      )}

      {isTrailerModalOpen && (
        <Suspense fallback={null}>
          <TrailerModal
            isOpen={isTrailerModalOpen}
            onClose={() => setIsTrailerModalOpen(false)}
            videoKey={trailerVideoKey}
          />
        </Suspense>
      )}

      {isTrailerErrorModalOpen && (
        <Suspense fallback={null}>
          <TrailerErrorModal
            isOpen={isTrailerErrorModalOpen}
            onClose={() => setIsTrailerErrorModalOpen(false)}
          />
        </Suspense>
      )}

      {isTeamModalOpen && (
        <Suspense fallback={null}>
          <TeamModal
            isOpen={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
