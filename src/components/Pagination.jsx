// src/components/Pagination.jsx
import React from 'react';

export function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const maxButtons = 5;
  let start = Math.max(currentPage - 2, 1);
  let end = Math.min(start + maxButtons - 1, totalPages);

  if (end - start < maxButtons - 1) {
    start = Math.max(end - maxButtons + 1, 1);
  }

  const pages = [];

  // Previous button
  pages.push(
    <button
      key="prev"
      className="pagination-arrow"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      &laquo;
    </button>
  );

  // First page
  if (start > 1) {
    pages.push(
      <button
        key={1}
        className="pagination-btn"
        onClick={() => onPageChange(1)}
      >
        1
      </button>
    );
    if (start > 2) {
      pages.push(<span key="dots1" className="pagination-dots">...</span>);
    }
  }

  // Page numbers
  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }

  // Last page
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push(<span key="dots2" className="pagination-dots">...</span>);
    }
    pages.push(
      <button
        key={totalPages}
        className="pagination-btn"
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </button>
    );
  }

  // Next button
  pages.push(
    <button
      key="next"
      className="pagination-arrow"
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      &raquo;
    </button>
  );

  return <div className="pagination">{pages}</div>;
}
