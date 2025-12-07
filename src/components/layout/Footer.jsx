// src/components/layout/Footer.jsx
import React from 'react';
const sprite = `${import.meta.env.BASE_URL}img/symbol-defs.svg`;



export function Footer({ onTeamModalOpen }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>
          &copy; 2025 | All Rights Reserved | Developed with
          <svg className="footer-heart">
            <use xlinkHref={`${sprite}#icon-heart`}></use>
          </svg>
          by <a href="#" className="footer-link" onClick={(e) => {
            e.preventDefault();
            onTeamModalOpen && onTeamModalOpen();
          }}>GoIT Students</a>
        </p>
      </div>
    </footer>
  );
}
