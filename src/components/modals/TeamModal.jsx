import React, { useEffect } from 'react';

export function TeamModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      id="team-modal-backdrop"
      onClick={handleBackdropClick}
      translate="no"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
    >
      <div className="modal-window team-modal-window">
        <button
          type="button"
          id="team-modal-close-btn"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close team modal"
        >
          &times;
        </button>

        <h2 id="team-modal-title" className="team-title">
          Our Team
        </h2>
        <p className="team-subtitle">Built with care for Cinemania</p>

        <div className="team-list">
          <div className="team-member">
            <div className="member-img-wrapper">
              <img
                src={`${import.meta.env.BASE_URL}img/omer.jpg`}
                alt="Omer Ozdemir"
                className="member-img"
              />
            </div>
            <h3 className="member-name">Omer Ozdemir</h3>
            <p className="member-role">Team Lead</p>
            <div className="member-social">
              <a
                href="https://github.com/omerozdemir7"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
