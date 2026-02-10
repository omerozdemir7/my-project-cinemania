import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LoginModal({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose();
      setEmail('');
      setPassword('');
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      id="auth-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-window auth-window">
        <button type="button" className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="auth-content">
          <h2 id="auth-title">{isLoginMode ? 'Login' : 'Register'}</h2>

          <form id="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              id="auth-email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              id="auth-password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              id="auth-submit-btn"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch-text">
            {isLoginMode
              ? "Don't have an account? "
              : 'Already have an account? '}
            <span
              id="auth-switch-btn"
              onClick={() => setIsLoginMode(!isLoginMode)}
              style={{ color: 'orange', cursor: 'pointer' }}
            >
              {isLoginMode ? 'Register here' : 'Login here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
