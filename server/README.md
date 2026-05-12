# Cmdly Server (optional)

**The app does not need this.** The web and Android clients are offline-first: bundled data, local search, and saved commands live on the device. There is no API in normal use.

This folder is only if you choose to run a tiny **optional** HTTP service (for example a feedback stub or ops health checks). Nothing in the main product depends on it.

If you do run it, it includes **rate limiting** so a public URL cannot be hammered without basic throttling—that is normal hardening for any HTTP surface, not something the end user’s “data app” experience uses.

## Run locally

```bash
cd server
npm install
npm run dev
```

Server defaults to `http://localhost:8787`.

## Bearer keys (optional)

If you set `API_KEYS`, requests must include `Authorization: Bearer <key>`.

Example `.env`:

```bash
API_KEYS=dev_key_1,dev_key_2
PORT=8787
```

## Rate limits (only for this optional server)

Defaults if you expose the server:

- Per IP: 120 requests/minute
- Per user/principal: 240 requests/minute

Override with `RATE_LIMIT_IP_WINDOW_MS`, `RATE_LIMIT_IP_MAX`, `RATE_LIMIT_USER_WINDOW_MS`, `RATE_LIMIT_USER_MAX`.

## Endpoints

- `GET /health`
- `POST /v1/feedback`
