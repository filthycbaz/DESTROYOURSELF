import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "controllers/**/*.js",
        "middlewares/**/*.js",
        "models/**/*.js",
      ],
      exclude: ["node_modules", "tests", "seed.js", "app.js"],
      thresholds: {
        lines: 80,
        functions: 90,
        branches: 65, // ramas catch(next(error)) no son alcanzables sin inyectar fallos de BD
        statements: 80,
      },
    },
    // Aislamiento: cada suite arranca con BD limpia
    sequence: { concurrent: false },
    // Reporter JUnit nativo de Vitest (sin dependencia nueva) — se publica como
    // artefacto en CI para inspección de resultados fuera del log de la corrida.
    reporters: ["default", "junit"],
    outputFile: { junit: "./test-results/junit.xml" },
  },
});
