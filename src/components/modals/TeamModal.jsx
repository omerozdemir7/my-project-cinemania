// src/components/modals/TeamModal.jsx
import React, { useEffect } from 'react';

export function TeamModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" id="team-modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-window team-modal-window">
        <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>

        <h2 className="team-title">Our Dream Team</h2>
        <p className="team-subtitle">The creative minds behind Cinemania</p>

        <div className="team-list">
          <div className="team-member">
            <div className="member-img-wrapper">
            <img
  src={`${import.meta.env.BASE_URL}img/omer.jpg`}
  alt="Student 1"
  className="member-img"
/>


            </div>
            <h3 className="member-name">Ömer ÖZDEMİR</h3>
            <p className="member-role">Team Lead</p>
            <div className="member-social">
              <a href="https://github.com/omerozdemir7" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
