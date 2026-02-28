import React, { useEffect } from 'react';

const sprite = `${import.meta.env.BASE_URL}img/symbol-defs.svg`;

export function Footer({ onTeamModalOpen }) {
  useEffect(() => {
    const handleTeamModalFallback = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const trigger = target.closest('[data-team-modal-trigger="true"]');
      if (!trigger) return;

      event.preventDefault();
      if (typeof onTeamModalOpen === 'function') {
        onTeamModalOpen();
      }
    };

    document.addEventListener('click', handleTeamModalFallback, true);
    return () =>
      document.removeEventListener('click', handleTeamModalFallback, true);
  }, [onTeamModalOpen]);

  return (
    <footer className="site-footer" translate="no">
      <div className="container">
        <p>
          &copy; 2025 | All Rights Reserved | Developed with
          <svg className="footer-heart">
            <use xlinkHref={`${sprite}#icon-heart`}></use>
          </svg>
          by{' '}
          <button
            type="button"
            className="footer-link"
            data-team-modal-trigger="true"
            onClick={() =>
              typeof onTeamModalOpen === 'function' && onTeamModalOpen()
            }
          >
            GoIT Students
          </button>
        </p>
      </div>
    </footer>
  );
}
