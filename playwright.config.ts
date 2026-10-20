import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 3,
  use: {
    baseURL: "http://127.0.0.1:4190",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
        (existsSync(chrome) ? chrome : undefined),
    },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4190 --strictPort",
    url: "http://127.0.0.1:4190",
    reuseExistingServer: false,
  },
});
