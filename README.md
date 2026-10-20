# Devkit Utilities

A private-by-design developer toolbox built with React, TypeScript, and Vite. Input is processed in your browser; no account or backend is required. The interface loads optional fonts from Google Fonts, with system fallbacks.

## Development

Requires Node.js 22.18 or later.

```sh
npm install
npm run dev
npm test
npm run build
```

`npm run build` checks TypeScript and creates the production bundle in `dist/`. Deploy that folder to any static web host. Never paste secrets into an untrusted browser or third-party deployment.
