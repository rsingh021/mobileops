// main.jsx — The very first file that runs when the app starts.
// Its only job is to find the <div id="root"> in index.html and mount the React app inside it.

import { StrictMode } from 'react'            // StrictMode runs extra checks in development to help catch bugs early
import { createRoot } from 'react-dom/client' // createRoot is the modern React 18 way to attach React to the DOM
import './index.css'                           // Loads global styles (Tailwind + base resets) for the entire app
import App from './App.jsx'                    // The root component — everything in the app lives inside <App />

// Find the <div id="root"> in index.html, then render <App /> inside it.
// StrictMode only affects development — it logs warnings and runs effects twice to expose bugs.
// It has zero impact on the production build.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
