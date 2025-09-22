## Ebbinghaus

Spaced-repetition flashcards app with a Laravel API and a React + Vite frontend.

### Monorepo layout

- `backend/`: Laravel 12 API (SQLite by default), migrations/seeders, study scheduling, optional AI deck generation
- `frontend/`: React 19 + TypeScript + Vite UI (React Router, TanStack Query, React Hook Form)

### Requirements

- PHP >= 8.2, Composer
- Node.js 20+ and npm
- SQLite (default) or another supported database

### Quick start

1) Backend (API)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate

# use SQLite by default
touch database/database.sqlite
php artisan migrate --seed

# start API (defaults to http://127.0.0.1:8000)
php artisan serve
```

Optional background workers/logs during development:

```bash
# run Laravel queue listener
php artisan queue:listen --tries=1

# tail structured logs (Laravel Pail)
php artisan pail --timeout=0
```

2) Frontend (Web)

By default the frontend points to `http://0.0.0.0:80/api/v1`. If your API runs on the default Laravel dev server, update `frontend/src/api/client.ts` to match it (e.g. `http://127.0.0.1:8000/api/v1`).

```bash
cd frontend
npm install
npm run dev
```

Open the printed Vite URL (typically `http://localhost:5173`).

### Environment variables

Backend (`backend/.env`):

- `DB_CONNECTION` (default `sqlite`)
- `DB_DATABASE` (e.g. `database/database.sqlite`)
- `OPENAI_API_KEY` (required for AI deck generation endpoint)

Frontend: none required by default. The API base URL is currently set in `src/api/client.ts`.

### API overview

Base URL: `/api/v1`

- Decks
  - `GET /decks` — list decks. Query params: `search`, `sort_by` (`title|description|created_at|updated_at`), `sort_dir` (`asc|desc`), `per_page` (1–100), `page`.
  - `POST /decks` — create deck `{ title: string, description?: string }`.
  - `GET /decks/{id}` — get deck.
  - `PATCH /decks/{id}` — update deck (partial).
  - `DELETE /decks/{id}` — delete deck and its cards.

- Cards (nested under deck; shallow routes for individual cards)
  - `GET /decks/{deck}/cards` — list cards in deck.
  - `POST /decks/{deck}/cards` — create card `{ front: string, back: string }`.
  - `GET /cards/{card}` — get card.
  - `PATCH /cards/{card}` — update card (partial).
  - `DELETE /cards/{card}` — delete card.

- Study
  - `GET /study/due` — due cards across all decks.
  - `GET /study/due/{deck}` — due cards for a specific deck.
  - `POST /study/review/{card}` — body `{ quality: 0..5 }`; returns next review scheduling data.

- AI Deck Generation
  - `POST /ai/generate-deck` — body `{ prompt: string, num_cards?: number (1–50), difficulty?: "easy|medium|hard", language?: string }`. Requires `OPENAI_API_KEY` on the server.

Example requests

```bash
# list decks
curl "http://127.0.0.1:8000/api/v1/decks?per_page=10&sort_by=created_at&sort_dir=desc"

# create a deck
curl -X POST "http://127.0.0.1:8000/api/v1/decks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Biology Basics","description":"Intro concepts"}'

# create a card in a deck
curl -X POST "http://127.0.0.1:8000/api/v1/decks/1/cards" \
  -H "Content-Type: application/json" \
  -d '{"front":"ATP","back":"Adenosine triphosphate"}'

# review a card with quality=4
curl -X POST "http://127.0.0.1:8000/api/v1/study/review/1" \
  -H "Content-Type: application/json" \
  -d '{"quality":4}'

# generate a deck with AI (requires OPENAI_API_KEY on the server)
curl -X POST "http://127.0.0.1:8000/api/v1/ai/generate-deck" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Basic Spanish phrases","num_cards":10,"difficulty":"easy","language":"es"}'
```

### Development scripts

Backend (from `backend/`):

- `composer test` — run Laravel tests
- `php artisan serve` — run API locally
- `php artisan migrate --seed` — migrate and seed

Frontend (from `frontend/`):

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run test`, `npm run test:watch`, `npm run test:coverage` — Vitest

### Notes

- Seed data: `DatabaseSeeder` calls `DeckSeeder` to populate sample content.
- If frontend and backend run on different origins, configure CORS in Laravel appropriately.


