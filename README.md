# Mini SaaS Template Store

A full-stack web app for browsing SaaS UI templates and saving favorites. Users can register, log in, search and filter a template gallery, and heart the templates they like; favorites are stored per user.

- **Frontend:** React 18 (Vite), Tailwind CSS, React Router v6, Axios
- **Backend:** Node.js, Express, MySQL (`mysql2`), JWT auth, bcrypt hashing
- **Layout:** monorepo with `server/` (REST API) and `client/` (SPA)

<!-- Add screenshots here, e.g. ![Gallery](docs/gallery.png) -->

## Features

- Register and log in with validation on both client and server, proper HTTP status codes, and bcrypt-hashed passwords
- JWT authentication, stored in `localStorage` and attached to every request by an Axios interceptor
- Template gallery with thumbnail, title, category badge and description
- Favorite toggle with a filled/outline heart and optimistic updates (rolled back if the request fails)
- Protected `/favorites` route: guests are redirected to `/login` and returned to the page they wanted after signing in
- Search box (debounced) and category dropdown on the gallery
- Responsive navbar with active links, signed-in user name and logout
- Loading skeletons, empty states, and error states with retry
- 8 realistic seeded templates

## Project structure

```
fullstack-intern-task/
├── package.json              # root scripts (run both apps together)
├── README.md
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js         # boots the app, checks DB, graceful shutdown
│       ├── app.js            # Express app: helmet, CORS, JSON, routes, error handling
│       ├── config/env.js     # environment loading and validation
│       ├── db/
│       │   ├── pool.js       # mysql2 connection pool
│       │   ├── schema.sql    # users, templates, favorites tables
│       │   ├── migrate.js    # creates the database and applies the schema
│       │   └── seed.js       # idempotent template seeding
│       ├── controllers/      # auth, templates, favorites
│       ├── routes/           # route definitions per resource
│       ├── middleware/       # auth (JWT) and error handling
│       └── utils/            # AppError, asyncHandler, jwt, validators
└── client/
    ├── package.json
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
- MySQL 8 (or MariaDB 10.5+) running locally

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url> fullstack-intern-task
cd fullstack-intern-task

npm run install:all        # installs root, server and client dependencies
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set at least `DB_PASSWORD` and `JWT_SECRET`. Generate a secret with:

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
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `template_store` | Database name (created automatically) |

The client needs no configuration in development. To point it at a remote API, copy `client/.env.example` to `client/.env` and set `VITE_API_URL`.

### 3. Create the database and seed data

```bash
npm run seed               # run from server/
```

This creates the database if it does not exist, applies the schema, and inserts the 8 templates. It is safe to run repeatedly: templates are upserted by name, so nothing is duplicated and users' favorites are kept.

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
| POST | `/auth/register` | – | Create account, returns `{ user, token }` | 201, 400, 409 |
| POST | `/auth/login` | – | Log in, returns `{ user, token }` | 200, 400, 401 |
| GET | `/auth/me` | Required | Current user (used to restore a session) | 200, 401 |
| GET | `/templates` | Optional | List templates. Query: `search`, `category` | 200 |
| GET | `/templates/categories` | – | Distinct category names | 200 |
| GET | `/templates/:id` | Optional | Template details | 200, 400, 404 |
| GET | `/favorites` | Required | Templates the user has favorited | 200, 401 |
| POST | `/favorites/:templateId` | Required | Add a favorite (idempotent) | 201 new, 200 existing, 404 |
| DELETE | `/favorites/:templateId` | Required | Remove a favorite (idempotent) | 200, 401 |

When a valid token is sent to `/templates` or `/templates/:id`, each template includes `is_favorite` so the UI can render the heart state in a single request.

Example:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"password123"}'

# Favorite template 1 (use the token from the response above)
curl -X POST http://localhost:5000/api/favorites/1 \
  -H "Authorization: Bearer <token>"
```

## Design notes

- **Security:** bcrypt (12 rounds), parameterized SQL everywhere, `helmet`, CORS restricted to `CLIENT_URL`, request body size limit, and rate limiting on login/register. Login returns the same error for unknown email and wrong password, and compares against a dummy hash for unknown emails so response time does not reveal which accounts exist.
- **Token handling:** the JWT lives in `localStorage` as specified. On load, the client verifies it with `/auth/me`; if any later request returns 401, the interceptor clears the token and the user is signed out.
- **Favorites integrity:** a composite primary key `(user_id, template_id)` prevents duplicates, and foreign keys cascade on delete.
- **Search and filter:** handled by the API with parameterized `LIKE` queries (wildcards in user input are escaped). The client debounces typing and cancels stale requests so results never arrive out of order.
- **Passwords:** the server uses `bcryptjs` (pure JavaScript) so installs never need native build tools.

## Scripts

| Location | Command | Purpose |
|---|---|---|
| root | `npm run install:all` | Install all dependencies |
| root | `npm run dev` | Run API and client together |
| root | `npm run build` | Production build of the client |
| `server/` | `npm run dev` / `npm start` | Run API with or without auto-reload |
| `server/` | `npm run migrate` | Create database and tables only |
| `server/` | `npm run seed` | Migrate and seed templates |
| `client/` | `npm run dev` / `build` / `preview` | Vite dev server, build, preview |

## Troubleshooting

- **`Could not connect to MySQL`**: check that MySQL is running and that `DB_USER` / `DB_PASSWORD` in `server/.env` are correct.
- **`ER_ACCESS_DENIED_ERROR` for `root`**: on some installs `root` needs a password. Set `DB_PASSWORD`, or create a dedicated user and use it.
- **Network error in the browser**: make sure the API is running on port 5000. The client uses Vite's proxy, so open the app via http://localhost:5173.
- **Thumbnails not loading**: images are served by the client from `client/public/templates/` (database values look like `/templates/<slug>.png`). If you ever change a thumbnail in `seed.js`, re-run `npm run seed` in `server/` to update existing rows. The card shows a gradient placeholder if an image fails to load.

## Author

- **Name:** [Your Name]
- **Email:** [your.email@example.com]
- **GitHub:** [github.com/your-username](https://github.com/your-username)
- **LinkedIn:** [linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)