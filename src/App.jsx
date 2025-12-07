// src/App.jsx
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

  // Theme toggle functionality
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
    const addGoogleTranslateScript = () => {
      if (document.querySelector('script[src*="translate.google.com"]')) return;
      
      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false
        }, 'google_translate_element');
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    };

    addGoogleTranslateScript();
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

        {/* Modals */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
        
        <MovieDetailsModal 
          isOpen={isMovieModalOpen} 
          onClose={() => setIsMovieModalOpen(false)}
          movieId={selectedMovieId}
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
