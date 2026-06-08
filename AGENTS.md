# Agent Instructions

This repo is a Vite-built browser extension. The unpacked extension to load into browsers is `dist`, not `src`.

## Local Build And Install

1. Install/build:

```bash
corepack enable
corepack pnpm@8.15.9 install
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 exec vite build --mode development
```

2. Open local browser extension pages:

```bash
corepack pnpm@8.15.9 open:extension-install
```

3. In each Chromium browser, enable Developer mode, click Load unpacked, and select the repo `dist` folder.

4. Enable Allow in Incognito if private-window tracking should be collected. Private activity is intentionally separate and only visible from the dashboard main page.

See `docs/LOCAL_EXTENSION_INSTALL.md` for the full install workflow.

## Development

- Use `VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com corepack pnpm@8.15.9 dev` for extension watch builds when testing login.
- Use `corepack pnpm@8.15.9 backend` for the local backend.
- Use `corepack pnpm@8.15.9 exec vue-tsc --noEmit` and `corepack pnpm@8.15.9 exec vite build --mode development` before handing off changes.
- The local backend data directory is `backend/data` and must stay untracked.
- Public sync backend target is `https://tracker.gabrielmalek.com`. See `docs/TRACKER_BACKEND_DEPLOYMENT.md` for DNS, Coolify, Docker, and env-var details.

## Google Login And Sync

- Create a Google OAuth Chrome Extension/Chrome App client for local development extension ID `bkiifobeblghdofgfbpakgoknebdkeec`.
- Build with `VITE_GOOGLE_OAUTH_CLIENT_ID` so `dist/manifest.json` receives the real client ID.
- Start the backend with `TRACKER_SESSION_SECRET` and `GOOGLE_OAUTH_CLIENT_IDS`; include the same client ID that was used for the extension build.
- Never print OAuth client secrets, session secrets, or backend secrets in logs or responses.
- The same Google account may have many browser/device installs. Keep the account as the source of truth and each extension install as a separate device.

## Infrastructure

When working with the user's infrastructure, check aliases in `~/.bash_aliases` and use the `whagons-infra` skill if available. Important aliases: `sshServer` is the local/Gabriel server; `sshWhagons` is the Whagons/job server. Coolify API key locations and base URLs are documented in the `whagons-infra` skill. Never print secret values.

- `gabrielmalek.com` DNS is on Cloudflare. `tracker.gabrielmalek.com` is an A record to `108.192.171.10`, unproxied.
- The Cloudflare secret in `~/.secrets/keys.json` is a legacy global API key and requires `X-Auth-Email`; do not commit that email or key.
- Use Gabriel Coolify for the tracker backend: `https://coolify.gabrielmalek.com`, secret key name `coolify-gabrielmalek`.
