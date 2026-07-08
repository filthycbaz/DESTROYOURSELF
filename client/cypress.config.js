const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
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
    apiUrl: "http://localhost:3001/api",
    TEST_USER_EMAIL: "seb@destroy.com",
    TEST_USER_PASSWORD: "password123",
  },
});
