/**
 * main.jsx — titik masuk aplikasi React (file bawaan Vite, diedit).
 *
 * Fungsi:
 * - Memuat CSS Bootstrap dan gaya global (index.css).
 * - Merender komponen App ke elemen div#root di index.html.
 *
 * Alur: index.html → main.jsx → App.jsx → routes → halaman.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import App from './App.jsx';

// ---------------------------------------------------------------------------
// Mount — pasang seluruh pohon React ke #root di index.html
// ---------------------------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
