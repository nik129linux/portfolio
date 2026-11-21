import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3107);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  workers: 2,
  use: { baseURL: `http://localhost:${port}`, trace: "off" },
  webServer: { command: `pnpm build && pnpm exec next start -p ${port}`, url: `http://localhost:${port}`, timeout: 240_000, reuseExistingServer: false },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
});
