# Twitter Account Location Flag

Adds a country flag next to Twitter/X usernames based on the account’s profile location. Supports Chrome (Manifest V3) and Firefox (Manifest V2 for AMO signing).

## Quickstart
- Chrome (load unpacked): `bash build-chrome.sh` then load `dist/chrome` at `chrome://extensions`.
- Chrome (zip for store): `bash build-chrome.sh` produces `dist/chrome.zip`.
- Firefox (self-distributed XPI, unlisted signing): run the Windows script `powershell -ExecutionPolicy Bypass -File compile.ps1 <api_key> <api_secret>`; artifacts land in `web-ext-artifacts`.
- Firefox (WSL/Linux signing): `bash compile.bash <api_key> <api_secret>` (requires WSL2/Linux `node`/`web-ext`).
- OR download the compiled versions on the releases tab of this github repo.


## What it does
- Detects usernames on Twitter/X pages (including dynamic/infinite scroll).
- Fetches location via Twitter/X GraphQL; falls back to a lightweight server cache (`https://twitter.superintendent.me`) to reduce rate-limit pain.
- Caches locations locally; hides posts from user-selected countries; throttles/queues requests to avoid hitting limits.

## Build artifacts
- `build-chrome.sh` → `dist/chrome/` (unpacked) and `dist/chrome.zip`.
- `compile.ps1` (Windows) or `compile.bash` (WSL/Linux) → `web-ext-artifacts/*.xpi` (unlisted signed for AMO).
- Manifests: `manifest.json` (Chrome MV3), `manifest.firefox.json` (Firefox MV2).

## Data we use and receive
- Server calls are proxied through Cloudflare; we receive your IP (forwarded) and User-Agent.
- Requests include the Twitter/X username you’re looking up (no tweet content).
- The server caches username + normalized country for faster responses.
- After your browser fetches a location, the extension may best-effort send that username+location to the server so rate-limited users can get it from cache.
- The extension’s Twitter/X GraphQL calls happen in your browser with your own cookies; they are not proxied through our server.

## Runtime files
- `background.js` — server bridge and fetch timeout helper.
- `content.js` — main logic: username detection, rate limiting, caching, flag injection.
- `pageScript.js` — injected into the page for authenticated GraphQL calls.
- `popup.html` / `popup.js` — UI for toggling and hiding countries.
- `countryFlags.js` — country-to-emoji map.

## Server (optional)
`server/app/main.py` exposes:
- `GET /healthcheck`
- `GET /check?a=<username>` — returns cached location or refreshes via provider.
- `POST /add` — upserts a location. The extension calls this opportunistically to keep the cache warm.

## Notes
- Firefox manifest uses MV2 because AMO doesn’t support MV3 service workers yet; Chrome uses MV3.
- `web_accessible_resources` are limited to Twitter/X origins; server calls go through the background script.
- If signing on Windows, run `compile.ps1`; WSL1 is not supported by `web-ext`.

## License
MIT
