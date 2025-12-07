import React, { useEffect } from 'react';

export function TrailerErrorModal({ isOpen, onClose }) {
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
    <div
      className="modal-backdrop"
      id="trailer-error-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-window trailer-error-window">
        <button type="button" className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="trailer-error-content">
          <div className="trailer-error-text">
            <h2>OOPS...</h2>
            <p>We are very sorry!</p>
            <p>But we couldn't find the trailer.</p>
          </div>

          <div className="trailer-error-image">
            <img
              src={`${import.meta.env.BASE_URL}img/trailer-modal.png`}
              alt="No Trailer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
