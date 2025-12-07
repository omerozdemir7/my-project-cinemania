// src/components/Loader.jsx
import React from 'react';

export function Loader() {
  const loaderStyle = {
    position: 'fixed',
    inset: 0,
 background: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    color: 'white',
    fontSize: '18px',
    flexDirection: 'column',
    backdropFilter: 'blur(3px)'
  };

  const spinnerStyle = {
    border: '6px solid #333',
    borderTop: '6px solid var(--primary-orange, orange)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
  };

  return (
    <div style={loaderStyle}>
      <div style={spinnerStyle}></div>
      <p>Loading...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
