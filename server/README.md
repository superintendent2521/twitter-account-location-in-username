# Username Location Cache API

FastAPI service that caches Twitter/X usernames and their last known location in Postgres. Cached rows stay fresh for 7 days; after that the service refreshes the location before returning a response.

## Endpoints

- `GET /healthcheck` — verifies the server is running and the database is reachable.
- `GET /check?a=<username>` — returns the cached/updated location for the given username. If the cache is older than 7 days the service refreshes it before responding.
- `POST /add` — manually insert/update a username/location in the cache. Body: `{"username": "...", "location": "..."}`.

Location values must match the country list from `countryFlags.js`; invalid names return HTTP 422/502.

## Quick start

1. Set environment variables (or create a `.env` file):
   - `DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/twitter_location`
   - Optional: `CACHE_TTL_DAYS=7`
2. Install dependencies:
   ```bash
   cd server
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Make sure Postgres is running with a database that matches `DATABASE_URL`.
4. Start the API:
   ```bash
   uvicorn app.main:app --reload
   ```

Tables are auto-created on startup. The actual location lookup is stubbed in `app/location_provider.py`; replace it with a call to Twitter/X or another data source that returns a location string.

## Response shape

`/check` returns:

```json
{
  "username": "example",
  "location": "United States",
  "cached": true,
  "last_checked": "2024-04-01T12:00:00Z",
  "expires_at": "2024-04-08T12:00:00Z"
}
```

`cached` is `true` when the stored row is younger than `CACHE_TTL_DAYS`; otherwise the service refreshes the entry before responding.
