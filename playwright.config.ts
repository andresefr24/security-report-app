import { defineConfig, devices } from "@playwright/test";

// Configuración de las pruebas de extremo a extremo (Playwright).
//
// Corren contra el BUILD real servido con `vite preview` (no el dev server), para
// probar la app tal como se despliega —service worker incluido—, no una versión
// de desarrollo. Playwright levanta el servidor solo.

const PUERTO = 4173;

export default defineConfig({
  testDir: "./e2e",
  // En local reutiliza un preview ya levantado; en CI arranca uno limpio.
  webServer: {
    command: "npm run build && npm run preview -- --port " + PUERTO,
    port: PUERTO,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    // Traza guardada solo si un test falla, para poder depurarlo.
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
