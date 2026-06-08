import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const distPath = resolve(repoRoot, 'dist');

const browsers = [
  {
    name: 'Google Chrome',
    app: '/Applications/Google Chrome.app',
    url: 'chrome://extensions',
  },
  {
    name: 'Brave Browser',
    app: '/Applications/Brave Browser.app',
    url: 'brave://extensions',
  },
  {
    name: 'Microsoft Edge',
    app: '/Applications/Microsoft Edge.app',
    url: 'edge://extensions',
  },
  {
    name: 'Arc',
    app: '/Applications/Arc.app',
    url: 'arc://extensions',
  },
  {
    name: 'Vivaldi',
    app: '/Applications/Vivaldi.app',
    url: 'vivaldi://extensions',
  },
];

try {
  spawnSync('pbcopy', { input: distPath });
  console.log(`Copied extension build path to clipboard:\n${distPath}\n`);
} catch {
  console.log(`Extension build path:\n${distPath}\n`);
}

const installed = browsers.filter(browser => existsSync(browser.app));

if (installed.length === 0) {
  console.log('No supported Chromium browsers found in /Applications.');
  process.exit(0);
}

for (const browser of installed) {
  console.log(`Opening ${browser.name}: ${browser.url}`);
  execFileSync('open', ['-a', browser.app, browser.url]);
}

console.log(`
In each browser:
1. Enable Developer mode.
2. Click Load unpacked.
3. Select the dist folder path copied to your clipboard.
4. Enable Allow in Incognito if private-window tracking should be collected.
`);
