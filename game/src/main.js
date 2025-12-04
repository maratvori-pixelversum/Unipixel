import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './components/ui/responsive-scaling.css'

// ============================================================================
// GLOBAL ERROR SUPPRESSION - Catches errors before React
// ============================================================================
// This must be the FIRST thing that runs to catch all errors

// Suppress null/undefined errors at the absolute earliest point
const originalConsoleError = console.error;
console.error = function(...args) {
  // Suppress null/undefined
  if (args.length === 1 && (args[0] === null || args[0] === undefined)) {
    return; // Silent suppression
  }

  // Suppress "Script error."
  if (args.length === 1 && args[0] === 'Script error.') {
    return; // Silent suppression
  }

  // Suppress React's error logging for null errors
  const firstArg = args[0];
  if (typeof firstArg === 'string' && firstArg.includes('Error:') && args[1] === null) {
    return; // Silent suppression
  }

  // Call original for real errors
  originalConsoleError.apply(console, args);
};

// Also catch window-level errors
window.addEventListener('error', (event) => {
  if (!event.error || event.error === null || event.message === 'Script error.') {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
}, true); // Use capture phase to catch early

window.addEventListener('unhandledrejection', (event) => {
  if (!event.reason || event.reason === null || event.reason === 'Script error.') {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
}, true); // Use capture phase to catch early

// Disable StrictMode to prevent double-rendering and initialization issues
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
