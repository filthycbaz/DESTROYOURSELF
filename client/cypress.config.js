const { defineConfig } = require("cypress");

// Por defecto apunta al entorno local (client + server corriendo en
// localhost). Para correr esta suite contra un despliegue real (por ejemplo
// para un smoke test post-deploy en Render) sobreescribí sin tocar este
// archivo:
//   CYPRESS_BASE_URL=https://<static-site>.onrender.com \
//   CYPRESS_apiUrl=https://<web-service>.onrender.com/api \
//   npx cypress run
// Cypress reconoce CYPRESS_BASE_URL y CYPRESS_<key> automáticamente.
const baseUrl = process.env.CYPRESS_BASE_URL || "http://localhost:3000";
const apiUrl = process.env.CYPRESS_apiUrl || "http://localhost:3001/api";

module.exports = defineConfig({
  e2e: {
    baseUrl,
    viewportWidth: 1280,
    viewportHeight: 800,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    // Seeded by server/seed.js — see docs/testing.md "Datos de prueba".
    // Override via CYPRESS_TEST_USER_EMAIL / CYPRESS_TEST_USER_PASSWORD
    // (or cypress.env.json, gitignored) instead of editing test files.
    apiUrl,
    TEST_USER_EMAIL: "seb@destroy.com",
    TEST_USER_PASSWORD: "password123",
  },
});
