import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * React 18 Entry Point (Fixed Version)
 *
 * NOTE: StrictMode is DISABLED in this version to prevent
 * double-mounting of componentDidMount in development.
 *
 * React 18's StrictMode intentionally double-invokes componentDidMount
 * in development to help detect side effects. This can cause issues
 * with the Container component's initialization logic.
 *
 * For production builds, this doesn't matter as StrictMode
 * is automatically disabled.
 */

const root = ReactDOM.createRoot(document.getElementById('root'));

// Without StrictMode - prevents double mounting
root.render(<App />);

// If you want StrictMode (causes double mounting in dev):
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
