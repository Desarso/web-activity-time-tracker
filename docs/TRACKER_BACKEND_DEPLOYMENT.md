# Tracker Backend Deployment

The shared sync backend should live at:

```text
https://tracker.gabrielmalek.com
```

## DNS

- Domain: `gabrielmalek.com`
- DNS provider: Cloudflare
- Authoritative nameservers checked on 2026-06-08: `ulla.ns.cloudflare.com`, `kyree.ns.cloudflare.com`
- Record created on 2026-06-08:

```text
A tracker.gabrielmalek.com -> 108.192.171.10
TTL: Auto
Proxied: false
```

`coolify.gabrielmalek.com` points to the same host. Keep `tracker.gabrielmalek.com` unproxied unless the backend is explicitly tested behind Cloudflare proxy.

Cloudflare credentials are stored locally in `~/.secrets/keys.json` under `cloudflare.api_key`. That key is a legacy global API key shape, not a Bearer token, so Cloudflare API calls require:

```text
X-Auth-Email: <Cloudflare account email>
X-Auth-Key: <cloudflare.api_key>
```

Do not commit the account email or API key into this repo.

## Coolify

- Target Coolify: `https://coolify.gabrielmalek.com`
- API secret key name: `coolify-gabrielmalek`
- Server listed by Coolify: `southgate`
- Public backend URL: `https://tracker.gabrielmalek.com`
- Dockerfile: repo root `Dockerfile`
- Container port: `8787`
- Persistent data path: `/data`
- Git repository: `https://github.com/Desarso/web-activity-time-tracker`
- Current working branch: `codex/local-sync-extension-install`

Manual Coolify setup:

1. Create a new application from a public Git repository.
2. Use repository `https://github.com/Desarso/web-activity-time-tracker`.
3. Use branch `codex/local-sync-extension-install` until this work is merged.
4. Select the Dockerfile build pack.
5. Keep the base directory at `/`.
6. Set the application port to `8787`.
7. Set the public domain to `https://tracker.gabrielmalek.com`.
8. Add persistent storage mounted at `/data`.
9. Add the production environment variables below.
10. Deploy and verify `https://tracker.gabrielmalek.com/api/health`.

Required environment variables:

```text
PORT=8787
TRACKER_DATA_DIR=/data
TRACKER_SESSION_SECRET=<strong random secret>
GOOGLE_OAUTH_CLIENT_IDS=<comma-separated OAuth client IDs>
```

The backend exposes:

```text
GET /api/health
POST /api/auth/google
GET /api/me
POST /api/sync/snapshot
GET /api/activity
```

Use `/api/health` for Coolify health checks.

## Extension Build

The extension defaults to `https://tracker.gabrielmalek.com`.

Build with the Google OAuth client ID:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 exec vite build --mode development
```

For local-only backend testing:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
VITE_SYNC_API_BASE_URL=http://localhost:8787 \
corepack pnpm@8.15.9 exec vite build --mode development
```

The stable local extension ID is:

```text
bkiifobeblghdofgfbpakgoknebdkeec
```

Create the Google OAuth Chrome Extension/Chrome App client against that extension ID.
