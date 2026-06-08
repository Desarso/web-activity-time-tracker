# Web Activity Time Tracker Backend

Local development:

```bash
TRACKER_SESSION_SECRET=change-me pnpm backend
```

The extension talks to `http://localhost:8787` by default. For production, set:

- `PORT`
- `TRACKER_SESSION_SECRET`
- `GOOGLE_OAUTH_CLIENT_IDS` as a comma-separated list for Chrome, Edge, and dev extension OAuth clients
- `TRACKER_DATA_DIR` or `TRACKER_DATA_FILE`

Auth flow:

1. The extension uses Chrome Identity to get a Google access token.
2. The backend verifies the token with Google's OpenID userinfo endpoint.
3. The backend creates an app session token.
4. Each extension install registers as a separate device under the same Google account.

Sync model:

- `users`: one account per Google subject.
- `devices`: one record per browser/extension install.
- `activity`: per-account, per-device, per-day, per-domain rollups.
- `intervals`: per-account, per-device daily visit interval ranges.

This backend uses a JSON file for persistence so the product contract is real while the project is still small. The same API shape can later move to Postgres.
