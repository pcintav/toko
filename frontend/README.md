# Frontend — Latihan Toko Online

React + Vite. Butuh backend di `http://localhost:5000` (lihat README root).

## Setup

```bash
copy .env.example .env.development
npm install
npm run dev
```

Buka `http://localhost:5173`.

`VITE_API_URL` harus mengarah ke URL backend.

## Folder penting

| Path | Isi |
|------|-----|
| `src/pages/` | Halaman publik, `/admin/*`, `/akun/*` |
| `src/api/` | `client.js` (publik), `adminApi.js`, `pembeliApi.js` |
| `src/components/` | Layout, kartu produk, komponen admin bersama |

Dokumentasi alur fullstack: `../backend/docs/ALUR-CODING.md`.
