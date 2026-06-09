# Tracker Backend Deployment

The shared sync backend should live at:

```text
https://tracker.gabrielmalek.com
```

## DNS

- Domain: `gabrielmalek.com`
- DNS provider: Cloudflare
- Authoritative nameservers checked on 2026-06-08: `ulla.ns.cloudflare.com`, `kyree.ns.cloudflare.com`
- Record created on 2026-06-08 and proxied on 2026-06-08 after the backend was
  verified through Cloudflare:

```text
A tracker.gabrielmalek.com -> 108.192.171.10
TTL: Auto
Proxied: true
```

`coolify.gabrielmalek.com` points to the same host. The Tracker record is
proxied so local browsers do not need to hairpin through the home router to
reach the public IP while on the LAN.

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
- Server UUID: `hco0w0ogo0ck84swoc88w0so`
- Project: `Server`
- Project UUID: `d0gkcck`
- Environment: `production`
- Environment UUID: `kgss08gk04oo04gwcs8o8sg8`
- Docker destination UUID: `lk4kw4g04w0ggooogw80go08`
- Application name: `Tracker Backend`
- Application UUID: `so0hrkmaa2sk5l77lp44mnzw`
- Public backend URL: `https://tracker.gabrielmalek.com`
- Dockerfile: repo root `Dockerfile`
- Container port: `8787`
- Persistent data path: `/data`
- Persistent storage name: `so0hrkmaa2sk5l77lp44mnzw-tracker-data`
- Persistent storage UUID: `a1ssnsfb2lvw7r214f97a9hq`
- Git repository: `https://github.com/Desarso/web-activity-time-tracker`
- Current working branch: `codex/local-sync-extension-install`
- Last verified deployment: 2026-06-08, commit `c5842beb9142091829e40c4de9a96bb981fda08d`

The backend was verified from an external host at:

```text
GET https://tracker.gabrielmalek.com/api/health -> 200
```

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

## Google OAuth Setup

There are two IDs involved:

- Extension ID: `bkiifobeblghdofgfbpakgoknebdkeec`
- OAuth client ID: the Google-created value ending in `.apps.googleusercontent.com`

Use the extension ID when creating the OAuth client. Use the OAuth client ID when building the extension and configuring the backend.

Recommended Google Cloud project, if no tracker-specific project has been created yet:

```text
gabrielmalekoauth
```

Create the OAuth client:

1. Open `https://console.cloud.google.com/auth/clients?project=gabrielmalekoauth`.
2. If prompted, configure Google Auth Platform / OAuth consent first.
3. Create a client.
4. Application type: `Chrome Extension`.
5. Name: `Web Activity Time Tracker Local`.
6. Application ID / Extension ID: `bkiifobeblghdofgfbpakgoknebdkeec`.
7. Copy the generated OAuth client ID ending in `.apps.googleusercontent.com`.

The active local `gcloud` project may be unrelated. On 2026-06-08 it was `workout-app-56f96`, so do not rely on the active CLI project for tracker OAuth setup.

Do not use `gcloud iam oauth-clients create` for this Chrome extension. That command creates IAM OAuth client resources with `public-client` / `confidential-client` types, not Google Auth Platform Chrome Extension clients tied to an extension Item ID. `gcloud iap oauth-clients create` is also wrong; it creates Cloud IAP OAuth clients. As of the checked Google Cloud CLI version `569.0.0`, the Chrome Extension OAuth client type still needs the Google Auth Platform Clients UI.

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
