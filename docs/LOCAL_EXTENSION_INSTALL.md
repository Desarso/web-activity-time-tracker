# Local Extension Install

Use this when installing the development build on another computer or browser.

## Build

```bash
corepack enable
corepack pnpm@8.15.9 install
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 exec vite build --mode development
```

The unpacked extension folder is:

```text
dist
```

The development build uses this stable local extension ID across machines:

```text
bkiifobeblghdofgfbpakgoknebdkeec
```

If an older unpacked build was already loaded with another ID, remove it from the browser and load the rebuilt `dist` folder again.

For active development, keep this running:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 dev
```

The normal development build points sync traffic at:

```text
https://tracker.gabrielmalek.com
```

For a local-only backend test build:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
VITE_SYNC_API_BASE_URL=http://localhost:8787 \
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

The hosted extension default is:

```text
https://tracker.gabrielmalek.com
```

For local-only testing, rebuild with:

```text
VITE_SYNC_API_BASE_URL=http://localhost:8787
```

The backend stores local JSON data under `backend/data`, which is gitignored.

Hosted backend deployment notes live in `docs/TRACKER_BACKEND_DEPLOYMENT.md`.

## Google Login

Three IDs can matter here:

- Extension ID: `bkiifobeblghdofgfbpakgoknebdkeec`
- Chrome Extension OAuth client ID: used by Chrome's extension identity API
- Web OAuth client ID: used by Brave's `launchWebAuthFlow` fallback

Before Chrome sign-in works, create a Google OAuth client for the local extension:

1. In Google Cloud Console, open APIs & Services.
2. Configure the OAuth consent screen for a personal/internal test app.
3. Create an OAuth client for a Chrome Extension/Chrome App.
4. Use this extension ID: `bkiifobeblghdofgfbpakgoknebdkeec`.
5. Rebuild with `VITE_GOOGLE_OAUTH_CLIENT_ID=<client-id>`.
6. Reload the unpacked extension in every browser.

Brave does not reliably use the same Chrome Extension identity flow. For Brave,
also create an OAuth client with Application type `Web application` and add this
authorized redirect URI:

```text
https://bkiifobeblghdofgfbpakgoknebdkeec.chromiumapp.org/google
```

Then build with both IDs:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=chrome-extension-client.apps.googleusercontent.com \
VITE_GOOGLE_WEB_OAUTH_CLIENT_ID=web-client.apps.googleusercontent.com \
corepack pnpm@8.15.9 exec vite build --mode development
```

Recommended Console URL if using the existing auth project:

```text
https://console.cloud.google.com/auth/clients?project=gabrielmalekoauth
```

Pass every accepted client ID to the backend. If you create Chrome and Brave
clients, pass both IDs as a comma-separated list:

```bash
GOOGLE_OAUTH_CLIENT_IDS=chrome-extension-client.apps.googleusercontent.com,web-client.apps.googleusercontent.com
```

The source manifest keeps a placeholder client ID on purpose. The Vite build replaces it in `dist/manifest.json` when `VITE_GOOGLE_OAUTH_CLIENT_ID` is set.

## Incognito

The manifest uses `"incognito": "spanning"`. Browsers still require enabling Allow in Incognito manually per browser. Private activity is tracked separately and is only shown from the dashboard main page.

## Quick Verification

```bash
corepack pnpm@8.15.9 exec vue-tsc --noEmit
corepack pnpm@8.15.9 exec vite build --mode development
node --check backend/server.mjs
```
