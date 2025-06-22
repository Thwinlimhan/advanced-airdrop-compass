import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global error handler to suppress external extension errors
const originalError = console.error;
console.error = (...args) => {
  // Suppress IndexSizeError from browser extensions
  if (args[0] && typeof args[0] === 'string' && args[0].includes('getRangeAt')) {
    return;
  }
  // Suppress other common external errors
  if (args[0] && typeof args[0] === 'string' && (
    args[0].includes('quick-trade') ||
    args[0].includes('content.bundle.js') ||
    args[0].includes('contents.1c4f7a5d.js')
  )) {
    return;
  }
  originalError.apply(console, args);
};

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  // Suppress external extension errors
  if (event.reason && typeof event.reason === 'string' && (
    event.reason.includes('getRangeAt') ||
    event.reason.includes('quick-trade') ||
    event.reason.includes('content.bundle.js')
  )) {
    event.preventDefault();
    return;
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
