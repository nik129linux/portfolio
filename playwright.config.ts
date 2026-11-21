import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3107);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  workers: 2,
  use: { baseURL: `http://localhost:${port}`, trace: "off" },
  webServer: { command: `NEXT_DIST_DIR=.next-e2e pnpm build && NEXT_DIST_DIR=.next-e2e pnpm exec next start -p ${port}`, url: `http://localhost:${port}`, timeout: 240_000, reuseExistingServer: false },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: process.env.E2E_CHROME ? { executablePath: process.env.E2E_CHROME } : {} } }],
});
