import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const logo = `${import.meta.env.BASE_URL}img/logo.png`;
const sprite = `${import.meta.env.BASE_URL}img/symbol-defs.svg`;

const LANGUAGES = [
  { code: 'tr', name: 'Turkish', flag: 'tr' },
  { code: 'fr', name: 'Francais', flag: 'fr' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'es', name: 'Espanol', flag: 'es' },
  { code: 'it', name: 'Italiano', flag: 'it' },
  { code: 'pt', name: 'Portugues', flag: 'pt' },
  { code: 'ru', name: 'Russian', flag: 'ru' },
  { code: 'ar', name: 'Arabic', flag: 'sa' },
  { code: 'fa', name: 'Persian', flag: 'ir' },
  { code: 'zh', name: 'Chinese', flag: 'cn' },
  { code: 'ja', name: 'Japanese', flag: 'jp' },
  { code: 'ko', name: 'Korean', flag: 'kr' },
];

export function Header({ onLoginClick }) {
  const { user, logout, resetPassword } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogoClick = (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setIsMenuOpen(true);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    await logout();
    window.location.reload();
  };

  const handlePasswordReset = async (e) => {
    if (e) e.preventDefault();

    if (user && user.email) {
      try {
        await resetPassword(user.email);
        alert('Password reset email sent! Please check your inbox.');
      } catch (error) {
        alert(`Failed to send password reset email: ${error.message}`);
      }
    }
  };

  const handleLanguageChange = (langCode) => {
    const cookieValue = `/auto/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    window.location.reload();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      if (isAccountDropdownOpen && !target.closest('#user-account-container')) {
        setIsAccountDropdownOpen(false);
        setIsLanguagesOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAccountDropdownOpen]);

  useEffect(() => {
    const handleLanguageOptionFallback = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const option = target.closest('[data-lang-code]');
      if (!option) return;

      event.preventDefault();
      const langCode = option.getAttribute('data-lang-code');
      if (langCode) {
        handleLanguageChange(langCode);
      }
    };

    document.addEventListener('click', handleLanguageOptionFallback, true);
    return () =>
      document.removeEventListener('click', handleLanguageOptionFallback, true);
  }, []);

  return (
    <header className="site-header notranslate" translate="no">
      <div className="container header-container">
        <Link to="/" className="logo" onClick={handleLogoClick}>
          <img src={logo} alt="Cinemania Logo" />
          <span>cprookie</span>
        </Link>

        <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}>
          <button className="mobile-nav-close" onClick={closeMenu}>
            &times;
          </button>
          <ul>
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive('/')}`}
                onClick={closeMenu}
              >
                HOME
              </Link>
            </li>
            <li>
              <Link
                to="/catalog"
                className={`nav-link ${isActive('/catalog')}`}
                onClick={closeMenu}
              >
                CATALOG
              </Link>
            </li>
            <li>
              <Link
                to="/library"
                className={`nav-link ${isActive('/library')}`}
                onClick={closeMenu}
              >
                MY LIBRARY
              </Link>
            </li>
          </ul>
        </nav>

        <div className="auth-buttons">
          {!user ? (
            <button id="btn-login" className="nav-link" onClick={onLoginClick}>
              Login / Register
            </button>
          ) : (
            <div
              id="user-account-container"
              className="user-dropdown-container"
            >
              <button
                id="btn-account"
                className="nav-link account-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAccountDropdownOpen(!isAccountDropdownOpen);
                }}
              >
                <span>My Account</span>
                <i
                  className="fas fa-chevron-down"
                  style={{ marginLeft: '5px', fontSize: '0.8em' }}
                ></i>
              </button>

              <div
                id="account-dropdown"
                className={`dropdown-content ${isAccountDropdownOpen ? 'show' : ''}`}
              >
                <div className="dropdown-user-info">
                  <span id="dropdown-email">{user.email}</span>
                </div>
                <hr />

                <div className="submenu-wrapper">
                  <button
                    id="btn-languages"
                    className={`dropdown-item submenu-trigger ${isLanguagesOpen ? 'open' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLanguagesOpen(!isLanguagesOpen);
                    }}
                  >
                    <span>
                      <i className="fas fa-globe"></i>
                      <span>Languages</span>
                    </span>
                    <i className="fas fa-chevron-right arrow-icon"></i>
                  </button>

                  <div
                    id="languages-list"
                    className={`submenu-content ${isLanguagesOpen ? 'show' : ''}`}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        type="button"
                        key={lang.code}
                        className="dropdown-item lang-opt"
                        data-val={lang.code}
                        data-lang-code={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <img
                          className="flag-icon"
                          src={`https://flagcdn.com/w20/${lang.flag}.png`}
                          alt={lang.name}
                        />
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                <a
                  href="#"
                  className="dropdown-item"
                  id="btn-change-password"
                  onClick={handlePasswordReset}
                >
                  <i className="fas fa-key"></i>
                  <span>Change Password</span>
                </a>

                <a
                  href="#"
                  className="dropdown-item"
                  id="btn-logout"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </a>
              </div>
            </div>
          )}

          <div className="theme-switcher">
            <label className="switch">
              <input type="checkbox" id="theme-toggle-checkbox" />
              <span className="slider round">
                <svg className="icon icon-sun">
                  <use xlinkHref={`${sprite}#icon-sun`}></use>
                </svg>
                <svg className="icon-moon">
                  <use xlinkHref={`${sprite}#icon-moon`}></use>
                </svg>
                <span className="slider-circle-container">
                  <svg className="slider-circle-white">
                    <use xlinkHref={`${sprite}#icon-circle1`}></use>
                  </svg>
                  <svg className="slider-circle-orange">
                    <use xlinkHref={`${sprite}#icon-circle1`}></use>
                  </svg>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-overlay active" onClick={closeMenu}></div>
      )}
    </header>
  );
}
