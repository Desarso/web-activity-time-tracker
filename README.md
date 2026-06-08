# Web Activity Time Tracker <a href="https://chrome.google.com/webstore/detail/web-activity-time-tracker/hhfnghjdeddcfegfekjeihfmbjenlomm" rel="nofollow"><img src="https://user-images.githubusercontent.com/768070/51865757-87d45300-2347-11e9-84fd-bafff5b036b2.png" alt="Add to Chrome" style="max-width:100%;"></a>

⚠️⚠️⚠️ **Important notice! The Chrome extension has been sold. So I am not responsible for any changes to the functionality of the extension.** ⚠️⚠️⚠️

**The new version is available on the Chrome Store https://chromewebstore.google.com/detail/timespy-block-websites-po/ggomgkmpcnmfhgmpfaphkbmnokllflom**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/d/hhfnghjdeddcfegfekjeihfmbjenlomm.svg?&label=Chrome%20users&ogo=google-chrome&logoColor=white)](https://chrome.google.com/webstore/detail/web-activity-time-tracker/hhfnghjdeddcfegfekjeihfmbjenlomm)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/hhfnghjdeddcfegfekjeihfmbjenlomm?&logoColor=white;label=Rating)](https://chrome.google.com/webstore/detail/web-activity-time-tracker/hhfnghjdeddcfegfekjeihfmbjenlomm)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/hhfnghjdeddcfegfekjeihfmbjenlomm.svg?&logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore/detail/web-activity-time-tracker/hhfnghjdeddcfegfekjeihfmbjenlomm)

[![Microsoft Edge Store](https://img.shields.io/badge/dynamic/json?label=Edge%20users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Feepmlmdenlkkjieghjmedjahpofieogf&color=gree)](https://microsoftedge.microsoft.com/addons/detail/web-activity-time-tracker/eepmlmdenlkkjieghjmedjahpofieogf)
[![Microsoft Edge Store](https://img.shields.io/badge/dynamic/json?label=Rating&suffix=/5&color=gree&query=%24.averageRating&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Feepmlmdenlkkjieghjmedjahpofieogf)](https://microsoftedge.microsoft.com/addons/detail/web-activity-time-tracker/eepmlmdenlkkjieghjmedjahpofieogf)
[![Microsoft Edge Store](https://img.shields.io/badge/dynamic/json?label=Microsoft%20Edge&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Feepmlmdenlkkjieghjmedjahpofieogf&logo=microsoft-edge)](https://microsoftedge.microsoft.com/addons/detail/web-activity-time-tracker/eepmlmdenlkkjieghjmedjahpofieogf)

Web Activity Time Tracker keeps track of how much time you spend on the web and presents the stats in a useful and intuitive way. 
You can set a daily visit limit for sites and block it after the expiration of the limit. 

The development version can sync activity across multiple browsers and devices through the backend in `backend/`. The shared backend target is `https://tracker.gabrielmalek.com`.

![image](https://user-images.githubusercontent.com/23387046/206865140-875bf7ab-a59e-42e3-bb9e-e348e8b85749.png) ![image](https://user-images.githubusercontent.com/23387046/206865174-aa409efe-495d-450e-a8ea-1d97024c9e23.png)

You can see your daily stats.

![image](https://github.com/Stigmatoz/web-activity-time-tracker/assets/23387046/d67c812c-2ba4-4ef8-a685-ab5fd77c7fbe)


And you can see your overall stats.

![image](https://github.com/Stigmatoz/web-activity-time-tracker/assets/23387046/6ea4547e-8bc6-4df7-ba0c-b5b330117270)


If you have suggestions or problems using the extension, please [submit a bug or a feature request](https://github.com/Stigmatoz/web-activity-time-tracker/issues).

# Chrome Web Store

Web Activity Time Tracker is available via the official [Chrome Web Store](https://chrome.google.com/webstore/detail/web-activity-time-tracker/hhfnghjdeddcfegfekjeihfmbjenlomm).

# Install as an extension from source

1. Build the unpacked extension:

```bash
corepack pnpm@8.15.9 install
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 exec vite build --mode development
```

2. Open local browser extension pages:

```bash
corepack pnpm@8.15.9 open:extension-install
```

3. In each Chromium browser, enable Developer mode.
4. Click "Load unpacked".
5. Select the `dist` directory from this repo.
6. Enable "Allow in Incognito" if private-window tracking should be collected.

More detailed agent/handoff instructions are in [docs/LOCAL_EXTENSION_INSTALL.md](docs/LOCAL_EXTENSION_INSTALL.md).

# Run

Extension watch build:

```bash
corepack pnpm@8.15.9 dev
```

Local backend:

```bash
TRACKER_SESSION_SECRET=change-me \
GOOGLE_OAUTH_CLIENT_IDS=your-client-id.apps.googleusercontent.com \
corepack pnpm@8.15.9 backend
```

The extension defaults to `https://tracker.gabrielmalek.com`. Set `VITE_SYNC_API_BASE_URL=http://localhost:8787` before building if you want a local-only test build.

Google login needs a Google OAuth Chrome Extension/Chrome App client for the stable local development extension ID:

```text
bkiifobeblghdofgfbpakgoknebdkeec
```

Set `VITE_GOOGLE_OAUTH_CLIENT_ID` before building the extension and pass the same client ID in `GOOGLE_OAUTH_CLIENT_IDS` when starting the backend.

Backend deployment notes are in [docs/TRACKER_BACKEND_DEPLOYMENT.md](docs/TRACKER_BACKEND_DEPLOYMENT.md).

# License

This work is licensed under an MIT License.
