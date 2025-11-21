import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * React 19 Entry Point
 * 
 * Uses the same createRoot API as React 18.
 * StrictMode is enabled for development best practices.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
