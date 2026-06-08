# Local Extension Install

Use this when installing the development build on another computer or browser.

## Build

```bash
corepack enable
corepack pnpm@8.15.9 install
corepack pnpm@8.15.9 exec vite build --mode development
```

The unpacked extension folder is:

```text
dist
```

For active development, keep this running:

```bash
corepack pnpm@8.15.9 dev
```

## Open Browser Extension Pages

On macOS, this repo includes a helper that copies the `dist` path to the clipboard and opens extension pages for installed Chromium browsers:

```bash
corepack pnpm@8.15.9 open:extension-install
```

Then, in each browser:

1. Open the extensions page if it is not already open.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the repo `dist` folder.
5. Enable Allow in Incognito if private-window tracking is needed.

Common URLs:

```text
chrome://extensions
brave://extensions
edge://extensions
arc://extensions
vivaldi://extensions
```

## Backend

Start the local backend before using Google sync:

```bash
TRACKER_SESSION_SECRET=change-me \
GOOGLE_OAUTH_CLIENT_IDS=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 backend
```

The extension defaults to:

```text
http://localhost:8787
```

The backend stores local JSON data under `backend/data`, which is gitignored.

## Google Login

Before sign-in works, replace the placeholder in `src/manifest.json`:

```json
"client_id": "REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com"
```

Create OAuth clients for each extension ID/browser variant you use, then pass all client IDs to the backend as a comma-separated list:

```bash
GOOGLE_OAUTH_CLIENT_IDS=chrome-client.apps.googleusercontent.com,edge-client.apps.googleusercontent.com
```

## Incognito

The manifest uses `"incognito": "spanning"`. Browsers still require enabling Allow in Incognito manually per browser. Private activity is tracked separately and is only shown from the dashboard main page.

## Quick Verification

```bash
corepack pnpm@8.15.9 exec vue-tsc --noEmit
corepack pnpm@8.15.9 exec vite build --mode development
node --check backend/server.mjs
```
