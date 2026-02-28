import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginModal } from './components/modals/LoginModal';
import { MovieDetailsModal } from './components/modals/MovieDetailsModal';
import { TrailerModal } from './components/modals/TrailerModal';
import { TrailerErrorModal } from './components/modals/TrailerErrorModal';
import { TeamModal } from './components/modals/TeamModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { LibraryPage } from './pages/LibraryPage';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isTrailerErrorModalOpen, setIsTrailerErrorModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
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

  useEffect(() => {
    const translateLogPattern = 'translate.googleapis.com/element/log';

    const originalFetch = window.fetch ? window.fetch.bind(window) : null;
    if (originalFetch) {
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input?.url;
        if (typeof url === 'string' && url.includes(translateLogPattern)) {
          return Promise.resolve(new Response('', { status: 204 }));
        }

        return originalFetch(input, init);
      };
    }

    const originalSendBeacon =
      typeof navigator.sendBeacon === 'function'
        ? navigator.sendBeacon.bind(navigator)
        : null;

    if (originalSendBeacon) {
      navigator.sendBeacon = (url, data) => {
        if (typeof url === 'string' && url.includes(translateLogPattern)) {
          return true;
        }

        return originalSendBeacon(url, data);
      };
    }

    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__skipTranslateLogRequest =
        typeof url === 'string' && url.includes(translateLogPattern);
      return originalXHROpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      if (this.__skipTranslateLogRequest) {
        return;
      }

      return originalXHRSend.apply(this, args);
    };

    const addGoogleTranslateScript = () => {
      if (document.querySelector('script[src*="translate.google.com"]')) return;

      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element',
        );
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    };

    addGoogleTranslateScript();

    return () => {
      if (originalFetch) {
        window.fetch = originalFetch;
      }

      if (originalSendBeacon) {
        navigator.sendBeacon = originalSendBeacon;
      }

      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, []);

  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
    setIsMovieModalOpen(true);
  };

  const handleWatchTrailer = (videoKey) => {
    if (videoKey) {
      setTrailerVideoKey(videoKey);
      setIsTrailerModalOpen(true);
    } else {
      setIsTrailerErrorModalOpen(true);
    }
  };

  return (
    <Router basename="/my-project-cinemania/">
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
                <CatalogPage
                  onMovieClick={handleMovieClick}
                  onWatchTrailer={handleWatchTrailer}
                />
              }
            />
            <Route
              path="/library"
              element={
                <LibraryPage
                  onMovieClick={handleMovieClick}
                  onWatchTrailer={handleWatchTrailer}
                />
              }
            />
          </Routes>
        </main>

        <Footer onTeamModalOpen={() => setIsTeamModalOpen(true)} />

        {}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        <MovieDetailsModal
          isOpen={isMovieModalOpen}
          onClose={() => setIsMovieModalOpen(false)}
          movieId={selectedMovieId}
          onRequireLogin={() => setIsLoginModalOpen(true)}
        />

        <TrailerModal
          isOpen={isTrailerModalOpen}
          onClose={() => setIsTrailerModalOpen(false)}
          videoKey={trailerVideoKey}
        />

        <TrailerErrorModal
          isOpen={isTrailerErrorModalOpen}
          onClose={() => setIsTrailerErrorModalOpen(false)}
        />

        <TeamModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
        />
      </div>
    </Router>
  );
}

export default App;
