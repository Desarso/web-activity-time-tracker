# Agent Instructions

This repo is a Vite-built browser extension. The unpacked extension to load into browsers is `dist`, not `src`.

## Local Build And Install

1. Install/build:

```bash
corepack enable
corepack pnpm@8.15.9 install
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

- Use `corepack pnpm@8.15.9 dev` for extension watch builds.
- Use `corepack pnpm@8.15.9 backend` for the local backend.
- Use `corepack pnpm@8.15.9 exec vue-tsc --noEmit` and `corepack pnpm@8.15.9 exec vite build --mode development` before handing off changes.
- The local backend data directory is `backend/data` and must stay untracked.

## Google Login And Sync

- `src/manifest.json` needs a real Google OAuth client ID before sign-in works.
- Start the backend with `TRACKER_SESSION_SECRET` and `GOOGLE_OAUTH_CLIENT_IDS`.
- Never print OAuth client secrets, session secrets, or backend secrets in logs or responses.
- The same Google account may have many browser/device installs. Keep the account as the source of truth and each extension install as a separate device.

## Infrastructure

When working with the user's infrastructure, check aliases in `~/.bash_aliases` and use the `whagons-infra` skill if available. Important aliases: `sshServer` is the local/Gabriel server; `sshWhagons` is the Whagons/job server. Coolify API key locations and base URLs are documented in the `whagons-infra` skill. Never print secret values.
