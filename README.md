<p align="center">
  <img src="./public/img/logo.png" alt="Cinemania logo" width="96" />
</p>

<h1 align="center">Cinemania</h1>

<p align="center">
  A modern movie discovery app built with React, Vite, TMDB API, and Firebase.
</p>

<p align="center">
  <a href="https://omerozdemir7.github.io/my-project-cinemania/">Live Demo</a>
  -
  <a href="#features">Features</a>
  -
  <a href="#quick-start">Quick Start</a>
  -
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black" />
  <img alt="TMDB" src="https://img.shields.io/badge/TMDB-API-01B4E4" />
  <img alt="License" src="https://img.shields.io/badge/License-Not%20Specified-lightgrey" />
</p>

## Overview

Cinemania is a movie browsing experience with:

- Home hero + weekly trends + upcoming movie highlights
- Search and year-filtered catalog with pagination
- Personal library management (Firebase-backed with local fallback behavior)
- Movie details modal with provider links and quick Google search
- Trailer modal (YouTube embed) with graceful error fallback
- Auth (register/login/logout/password reset)
- Theme toggle (dark/light)
- Multi-language switch powered by Google Translate widget

## Features

### Pages and Routes

- `/` Home page
- `/catalog` Search, year filter, paginated results
- `/library` User library with genre filtering

### User Flows

- Open details from any movie card or hero section
- Add/remove movies from "My Library"
- Watch trailer directly in modal
- Login/register in modal, then continue action
- Change language from account dropdown

### Robustness Notes

- If Firestore access is denied (for example rule misconfiguration), library sync falls back to local storage behavior and logs a warning instead of crashing the flow.
- Google Translate telemetry requests that are commonly blocked by ad blockers are neutralized to reduce noisy console errors.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, React Router, CSS |
| Build Tool | Vite 7 |
| Data API | TMDB API |
| Auth + DB | Firebase Auth + Cloud Firestore |
| Deploy | GitHub Pages (`gh-pages` + GitHub Actions) |

## Project Structure

```text
src/
  components/
    layout/
    modals/
    sections/
  hooks/
    useAuth.js
    useLibrary.js
    useMovieVideos.js
  pages/
    HomePage.jsx
    CatalogPage.jsx
    LibraryPage.jsx
  utils/
    firebase.js
    moviesApi.js
  App.jsx
  main.jsx
```

## Quick Start

### 1. Clone and Install

```bash
git clone git@github.com:omerozdemir7/my-project-cinemania.git
cd my-project-cinemania
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set your own keys.

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Required variables:

```env
VITE_TMDB_API_KEY=...

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### 3. Run Locally

```bash
npm run dev
```

Default dev server is configured to open on port `3000`.

## Firebase Setup

To avoid `Missing or insufficient permissions` errors for library sync:

1. Enable Email/Password in Firebase Authentication.
2. Create Cloud Firestore in your Firebase project.
3. Add rules similar to:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format source files with Prettier |
| `npm run deploy` | Deploy `dist/` to GitHub Pages using `gh-pages` |
| `npm run update` | Convenience script for add/commit/push/deploy |

## Deployment

### GitHub Pages

This project is configured with:

- `vite.config.js` base path: `/my-project-cinemania/`
- GitHub Actions workflow: `.github/workflows/deploy.yml`

On push to `main`, GitHub Pages deployment runs automatically.

If you fork this repository, update:

1. `base` in `vite.config.js`
2. Repo links in this README
3. GitHub Pages settings for your fork

## Troubleshooting

### Firestore permission errors

- Verify Firebase project values in `.env`
- Confirm Auth is enabled and user is signed in
- Check Firestore rules for `users/{uid}` access

### Translate request blocked by client

- `translate.googleapis.com/.../element/log` blocked by extensions is non-fatal
- App already suppresses this telemetry noise path

### Build warnings about chunk size

- Current app builds successfully
- Warning is informational; consider route-based code splitting later

## Security Note

- Do not commit real API keys or Firebase credentials in public repositories.
- If keys were committed before, rotate them in Firebase/TMDB.

## Roadmap Ideas

- Add automated tests (unit + integration)
- Replace legacy `src/js` scripts fully with React equivalents
- Add stronger i18n strategy beyond Google Translate widget
- Improve chunk splitting and performance budgets

## Acknowledgements

- [TMDB API](https://www.themoviedb.org/documentation/api)
- [Firebase](https://firebase.google.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
