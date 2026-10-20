# Devkit Utilities

A private-by-design developer toolbox built with React, TypeScript, and Vite. Input is processed in your browser; no account or backend is required. The interface loads optional fonts from Google Fonts, with system fallbacks.

## Development

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run build` checks TypeScript and creates the production bundle in `dist/`. Deploy that folder to any static web host. Never paste secrets into an untrusted browser or third-party deployment.

Browser regression tests cover tool actions, clipboard permissions, saved drafts, keyboard submission, and layouts from 320px to desktop:

```sh
npx playwright install chromium
npm run test:e2e
```

An installed Chrome is used automatically on macOS. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use another Chromium binary. Inputs and results are retained in memory while switching tools and are cleared on refresh; they are never saved to browser storage.
