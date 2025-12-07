// src/components/modals/TrailerModal.jsx
import React, { useEffect } from 'react';

export function TrailerModal({ isOpen, onClose, videoKey }) {
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
    <div className="modal-backdrop" id="trailer-modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-window trailer-modal-content">
        <button type="button" className="modal-close-btn" id="trailer-modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="trailer-modal-body">
          <iframe
            id="trailer-iframe"
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&showinfo=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
