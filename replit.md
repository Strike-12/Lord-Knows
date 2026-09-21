# Lord Knows Clothing

## Running on Replit

- Runtime: Node.js 20
- Start command: `npm run dev`
- Preview: the Express server listens on `0.0.0.0:5000`
- Health check: `/api/health`

The app serves the storefront and admin pages directly from the project root. Storefront data and contact submissions are stored in JSON files under `data/`, while uploaded images are saved under `assets/images/`.

## Environment

No external service is required for the development preview.

For any public deployment, set `ADMIN_PASSWORD` as a Replit secret so the server does not use its built-in development fallback.