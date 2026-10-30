# Winter Bash League 2026

The React website lives here. Start the frontend from this directory.

## Quick start

```powershell
npm ci
npm run dev
```

Vite prints the local address to open in your browser.

To create a production build:

```powershell
npm run build
```

The generated site is written to `dist/`. The repository-root workflow at
`../.github/workflows/deploy.yml` builds this app and deploys that output to
GitHub Pages when changes are pushed to `main`.

## Find things

| Path | What it contains |
| --- | --- |
| `src/pages/` | Full website pages |
| `src/components/` | Reusable page sections and UI |
| `src/App.jsx` | Page routes |
| `src/index.css` | Global styles |
| `public/images/` | All website images |
| `backend/` | Separate Express API and PostgreSQL setup |
| `old_html/` | Previous standalone HTML pages, kept for reference |
| `dist/` | Generated production output; do not edit directly |
| `node_modules/` | Installed dependencies; do not edit directly |

## Backend

The API is a separate Node.js app under `backend/`. Its environment variables
are documented in `backend/.env.example`; the frontend uses `.env.example`.
Create local `.env` files from those examples and configure the API URL and
database connection for your environment. Do not commit `.env` files.

Team registration availability is controlled from the Admin Portal. Use the
**Team registration** switch to open or close submissions. When closed, the
public Registration page displays “Registration starts soon · Stay tuned,” and
the API rejects new registration submissions. The setting is stored in
PostgreSQL and defaults to open for existing deployments.
Production deployment trigger – October 30, 2026.
