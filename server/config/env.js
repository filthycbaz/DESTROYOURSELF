import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";

// En test, mongodb-memory-server y tests/setup.js proveen MONGO_URI/JWT_SECRET
// en tiempo de ejecución (no al importar este módulo), así que no exigimos
// que existan como variables de entorno reales.
const required = isTest ? [] : ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missing.join(", ")}. ` +
      "Revisa server/.env (usa server/.env.example como referencia)."
  );
}

const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || null;
if (isProduction && !FRONTEND_URL) {
  throw new Error(
    "Falta configurar FRONTEND_URL en producción (URL del frontend desplegado)."
  );
}

const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!isProduction && corsAllowedOrigins.length === 0) {
  // En desarrollo, si no se define CORS_ALLOWED_ORIGINS, permitimos el
  // frontend local por defecto para no romper `npm run dev` recién clonado.
  corsAllowedOrigins.push("http://localhost:3000");
}

if (isProduction && corsAllowedOrigins.length === 0) {
  throw new Error(
    "Falta configurar CORS_ALLOWED_ORIGINS en producción (orígenes permitidos, separados por comas)."
  );
}

// Swagger UI expone la forma de la API — nunca abierto por defecto en producción.
// Se puede forzar en producción con ENABLE_DOCS=true (ej. para revisar un staging).
const docsEnabled = !isProduction || process.env.ENABLE_DOCS === "true";

export const env = {
  NODE_ENV,
  isProduction,
  PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL,
  corsAllowedOrigins,
  docsEnabled,
};
