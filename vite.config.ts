import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import copy from 'rollup-plugin-copy';

const APP_ID = {
  chrome: 'hhfnghjdeddcfegfekjeihfmbjenlomm',
  edge: 'eepmlmdenlkkjieghjmedjahpofieogf',
};
const browser = process.env.TARGET || 'chrome';
const LOCAL_DEV_EXTENSION_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1Mq6E7bZfBYXE4FdHSNprD9a9Q+mzF14Hi24WaM7BCb+2dQaCKTMh5x/MRoyxKyMPJuzmXEqDp23uaPCpXozi9SV5Nv3nPWpV6XEGM+fu7i62zwpQqchv4kwbxJGS79zeWlGaEGLnrtV16i+INz9CQpUKZhHWLRuRa+OulUyq0iN5i1PrLkJ8jO5FWZtsVIX8mfn12FQp7wmiw0jjG1fMzsBa8mFE7VMSO76pkOSGrJmKtWtJfPKBhcrBI9J8YaWhqOinth8eYbdporkXOcU5q1RMwQqPaujMuUDqTrc0kHhaUwi1cX+iZrRL9MFij4zC0GK7wAFS7SeGz46H29ikwIDAQAB';

function generateManifest(mode: string, env: Record<string, string>) {
  const manifest = readJsonFile('src/manifest.json');
  const pkg = readJsonFile('package.json');
  const googleOAuthClientId =
    env.VITE_GOOGLE_OAUTH_CLIENT_ID ||
    env.GOOGLE_OAUTH_CLIENT_ID ||
    env.GOOGLE_OAUTH_CLIENT_IDS?.split(',')[0]?.trim() ||
    manifest.oauth2?.client_id;
  const extensionPublicKey =
    env.VITE_EXTENSION_PUBLIC_KEY ||
    env.EXTENSION_PUBLIC_KEY ||
    (mode === 'development' ? LOCAL_DEV_EXTENSION_PUBLIC_KEY : '');

  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
    ...(extensionPublicKey ? { key: extensionPublicKey } : {}),
    oauth2: {
      ...manifest.oauth2,
      client_id: googleOAuthClientId,
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  build: {
    assetsInlineLimit: 1024,
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'icons';
          }
          return `assets/${extType}/[name][extname]`;
        },
      },
    },

    emptyOutDir: false,
    sourcemap: mode === 'development' ? 'inline' : false,
    minify: mode === 'development' ? false : true,
  },
  define: {
    'process.env': process.env,
    __EXTENSION_MODE__: JSON.stringify(mode),
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
    __APP_ID__: JSON.stringify(APP_ID[browser]),
    __BROWSER__: JSON.stringify(browser),
  },
  plugins: [
    vue(),
    VueI18nPlugin({
      include: path.resolve(__dirname, '..', 'src/assets/_locales/*'),
    }),
    webExtension({
      manifest: () => generateManifest(mode, env),
      watchFilePaths: ['package.json', 'src/manifest.json'],
      additionalInputs: ['src/block.html', 'src/welcome.html', 'src/offscreen.html'],
    }),
    copy({
      targets: [
        { src: 'src/_locales', dest: 'dist' },
        { src: 'src/assets/pomodoro-sounds', dest: 'dist/assets' },
      ],
    }),
  ],
  optimizeDeps: {
    include: ['vue', 'webextension-polyfill'],
  },
};
});
