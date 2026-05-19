/**
 * vite.config.js — pengaturan alat build Vite (file bawaan, diedit).
 *
 * Fungsi:
 * - Mengaktifkan plugin React (JSX, hot reload saat coding).
 * - Menetapkan port dev server 5173 (alamat http://localhost:5173).
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // port frontend; backend terpisah di port 5000
  },
})
