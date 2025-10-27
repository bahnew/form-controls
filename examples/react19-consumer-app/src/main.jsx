import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Get root element
const rootElement = document.getElementById('root');

// Create root and render app (React 19 style)
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
