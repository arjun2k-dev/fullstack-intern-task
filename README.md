# Mini SaaS Template Store

A full-stack web app for browsing SaaS UI templates and saving favorites. Users can register, log in, search and filter a template gallery, and heart the templates they like; favorites are stored per user.

- **Frontend:** React 18 (Vite), Tailwind CSS, React Router v6, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt hashing
- **Layout:** monorepo with `server/` (REST API) and `client/` (SPA)
- **Deployment:** configured for Vercel (static client + serverless API), see [Deployment](https://fullstack-intern-task-kq16.vercel.app/)

<!-- Add screenshots here, e.g. ![Gallery](docs/gallery.png) -->

## Features

- Register and log in with validation on both client and server, proper HTTP status codes, and bcrypt-hashed passwords
- JWT authentication, stored in `localStorage` and attached to every request by an Axios interceptor
- Template gallery with thumbnail, title, category badge and description
- Favorite toggle with a filled/outline heart and optimistic updates (rolled back if the request fails)
- Protected `/favorites` route: guests are redirected to `/login` and returned to the page they wanted after signing in
- Guest-only `/login` and `/register` routes: signed-in users are redirected away
- Search box (debounced) and category dropdown on the gallery
- Responsive navbar with active links, signed-in user name and logout
- Loading skeletons, empty states, and error states with retry
- 8 realistic seeded templates

## Project structure

```
fullstack-intern-task/
├── package.json              # root scripts (run both apps together)
├── vercel.json               # Vercel build + routing (client static build, /api -> serverless function)
├── README.md
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── api/
│   │   └── index.js          # Vercel serverless entry: connects to MongoDB, hands requests to Express
│   └── src/
│       ├── server.js         # boots the app, checks DB, graceful shutdown
│       ├── app.js            # Express app: helmet, CORS, JSON, routes, error handling
│       ├── config/env.js     # environment loading and validation
│       ├── db/
│       │   ├── connection.js # Mongoose connection helpers (connection is reused between calls)
│       │   ├── migrate.js    # creates collections and syncs indexes
│       │   └── seed.js       # idempotent template seeding
│       ├── models/           # Mongoose models: User, Template, Favorite
│       ├── controllers/      # auth, templates, favorites
│       ├── routes/           # route definitions per resource
│       ├── middleware/       # auth (JWT) and error handling
│       └── utils/            # AppError, asyncHandler, jwt, validators
└── client/
    ├── package.json
    ├── .env.example
    ├── vite.config.js        # dev proxy: /api -> http://localhost:5000
    ├── public/templates/     # the 8 template thumbnails (PNG, served at /templates/<slug>.png)
    ├── tailwind.config.js
    └── src/
        ├── main.jsx, App.jsx # providers and routes
        ├── api/              # Axios instance (JWT + 401 handling) and services
        ├── context/          # AuthContext (user, login, register, logout)
        ├── hooks/            # useAuth, useDebounce, useFavoriteToggle
        ├── components/       # Navbar, TemplateCard, route guards, form pieces
        └── pages/            # Login, Register, Templates, Favorites, NotFound
```

## Prerequisites

- Node.js 18 or newer
- MongoDB 6+ running locally, or a free MongoDB Atlas cluster

## Setup

### 1. Clone and install

```bash
git clone https://github.com/arjun2k-dev/fullstack-intern-task.git
cd fullstack-intern-task

npm run install:all        # installs root, server and client dependencies
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your **own** `MONGODB_URI` and `JWT_SECRET`. Do not reuse values you did not create yourself, and never commit a real connection string or secret. Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` to require `JWT_SECRET` and silence request logs |
| `PORT` | `5000` | API port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed browser origin(s), comma-separated |
| `JWT_SECRET` | dev-only fallback | Secret used to sign tokens. **Required in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/template_store` | MongoDB connection string (local or Atlas `mongodb+srv://...`). Must start with `mongodb://` or `mongodb+srv://`. The database is created automatically on first write |

The client needs no configuration in development. To point it at a remote API, copy `client/.env.example` to `client/.env` and set `VITE_API_URL` (for example `https://your-api.example.com/api`).

### 3. Create the database and seed data

```bash
npm run db:setup           # from the repository root
# or: npm run seed         # from server/
```

This creates the collections and indexes if they do not exist and inserts the 8 templates. It is safe to run repeatedly: templates are upserted by name, so nothing is duplicated and users' favorites are kept.

### 4. Run the app

From the repository root, start both apps together:

```bash
npm run dev
```

Or in two terminals: `npm run dev` inside `server/` and inside `client/`.

- Client: http://localhost:5173
- API: http://localhost:5000/api (health check at `/api/health`)

## API reference

Base URL: `http://localhost:5000/api`. Protected endpoints require `Authorization: Bearer <token>`.

Error responses share one shape: `{ "message": "...", "errors": { "field": "..." } }` (`errors` is present for validation problems).

| Method | Endpoint | Auth | Description | Status codes |
|---|---|---|---|---|
| GET | `/health` | – | Server and database status | 200, 503 |
| POST | `/auth/register` | – | Create account, returns `{ user, token }` | 201, 400, 409 |
| POST | `/auth/login` | – | Log in, returns `{ user, token }` | 200, 400, 401 |
| GET | `/auth/me` | Required | Current user (used to restore a session) | 200, 401 |
| GET | `/templates` | Optional | List templates. Query: `search`, `category` | 200 |
| GET | `/templates/categories` | – | Distinct category names | 200 |
| GET | `/templates/:id` | Optional | Template details | 200, 400, 404 |
| GET | `/favorites` | Required | Templates the user has favorited | 200, 401 |
| POST | `/favorites/:templateId` | Required | Add a favorite (idempotent) | 201 new, 200 existing, 400, 401, 404 |
| DELETE | `/favorites/:templateId` | Required | Remove a favorite (idempotent) | 200, 400, 401 |

When a valid token is sent to `/templates` or `/templates/:id`, each template includes `is_favorite` so the UI can render the heart state in a single request.

**Validation rules:** name 2-100 characters, a valid email (max 255), password 8-72 characters. Emails are trimmed and lower-cased.

Example:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"password123"}'

# Favorite a template (get a template id from GET /api/templates, and use the token from the response above)
curl -X POST http://localhost:5000/api/favorites/<templateId> \
  -H "Authorization: Bearer <token>"
```

## Deployment

The repo ships with a root `vercel.json` that builds both halves on Vercel:

- `client/` is built as a static site (`vite build`, output in `client/dist`).
- `server/api/index.js` is deployed as a serverless function. Every `/api/*` request is routed to it, it reuses the MongoDB connection while the function is warm, and it returns `503 Database unavailable` if the database cannot be reached.
- All other paths fall back to `client/index.html`, so React Router deep links such as `/favorites` work on refresh.

Set these environment variables in the Vercel project settings:

| Variable | Notes |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Required. Use a long random value |
| `MONGODB_URI` | Your Atlas connection string. Allow Vercel's outbound IPs in Atlas network access (or `0.0.0.0/0` if you accept that trade-off) |
| `CLIENT_URL` | Your production site URL (comma-separate multiple origins) |

`VITE_API_URL` is not needed when the client and API are deployed together, because the client calls the relative `/api` path.

Seed the production database once from your machine by running `npm run db:setup` with `MONGODB_URI` pointing at it.

## Design notes

- **Security:** bcrypt (12 rounds), Mongoose schemas and cast queries (no string-built queries; regex input is escaped), `helmet`, a request body size limit of 10 KB, and rate limiting on login/register (50 requests per 15 minutes per IP). Login returns the same error for unknown email and wrong password, and compares against a dummy hash for unknown emails so response time does not reveal which accounts exist.
- **CORS:** requests without an `Origin` header (curl, Postman) are allowed. Browser origins are allowed if they match `CLIENT_URL`, contain `localhost`, or end in `.vercel.app` (so Vercel preview deployments work). Tighten this check in `server/src/app.js` if you do not want any `*.vercel.app` site to call your API.
- **Token handling:** the JWT lives in `localStorage` (key `mst_token`). On load, the client verifies it with `/auth/me`; if any later request returns 401, the interceptor clears the token and the user is signed out. 401s from login/register are treated as wrong credentials and do not sign anyone out.
- **Favorites integrity:** a unique compound index on `(user, template)` prevents duplicates. MongoDB has no foreign keys, so deleting a user or template does not cascade; favorites pointing at a missing template are skipped when listing.
- **IDs:** documents use MongoDB ObjectIds, returned to the client as 24-character hex strings in the `id` field. Response field names (`thumbnail_url`, `is_favorite`, ...) are unchanged, so the client needs no changes.
- **Search and filter:** handled by the API with case-insensitive regex queries over name and description (special characters in user input are escaped). The client debounces typing and cancels stale requests so results never arrive out of order.
- **Passwords:** the server uses `bcryptjs` (pure JavaScript) so installs never need native build tools.

## Scripts

| Location | Command | Purpose |
|---|---|---|
| root | `npm run install:all` | Install all dependencies |
| root | `npm run dev` | Run API and client together |
| root | `npm run server` / `npm run client` | Run only the API or only the client |
| root | `npm run db:setup` | Migrate and seed templates (runs `seed` in `server/`) |
| `server/` | `npm run dev` / `npm start` | Run API with or without auto-reload |
| `server/` | `npm run migrate` | Create collections and sync indexes only |
| `server/` | `npm run seed` | Migrate and seed templates |
| `client/` | `npm run dev` / `build` / `preview` | Vite dev server, production build, preview the build |

## Troubleshooting

- **`Could not connect to MongoDB`**: check that `mongod` is running and that `MONGODB_URI` in `server/.env` is correct. For Atlas, add your IP to the cluster's network access list and URL-encode special characters in the password.
- **Atlas `mongodb+srv://` lookups fail (DNS errors)**: the server sets its DNS resolvers to `8.8.8.8` and `1.1.1.1` in `server/src/db/connection.js` to work around SRV lookup problems on some networks. If your network blocks those, remove or change that line.
- **Signed out after upgrading from the MySQL version**: tokens issued by the old version carry numeric ids and are rejected; just log in again (and re-register, since users are not migrated).
- **Network error in the browser**: make sure the API is running on port 5000. The client uses Vite's proxy, so open the app via http://localhost:5173.
- **CORS error against a deployed API**: add the site's origin to `CLIENT_URL` (comma-separated) on the server.
- **Thumbnails not loading**: images are served by the client from `client/public/templates/` (stored values look like `/templates/<slug>.png`). If you ever change a thumbnail in `seed.js`, re-run the seed to update existing documents. The card shows a gradient placeholder if an image fails to load.

## Author

- **Name:** ARJUN KUMAR J
- **Email:** arjunvedha25@gmail.com
- **GitHub:** [github.com/arjun2k-dev](https://github.com/arjun2k-dev)
- **LinkedIn:** [linkedin.com/in/arjunk-dev](https://www.linkedin.com/in/arjunk-dev)
