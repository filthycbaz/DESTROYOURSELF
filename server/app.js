
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

if (env.isProduction) {
  // Render (y otros proxies inversos) terminan TLS antes del proceso Node.
  // Sin esto, Express no confía en X-Forwarded-* (IP, protocolo) del proxy.
  app.set("trust proxy", 1);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
};

// CSP por defecto de helmet bloquea los scripts/estilos inline que usa
// swagger-ui-express — se desactiva acá; el resto de headers (X-Content-Type-Options,
// HSTS, etc.) quedan activos. No es una app que renderice HTML propio salvo /api-docs.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());

if (env.docsEnabled) {
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

app.use((err, req, res, next) => {
  // Mongoose validation errors → 400
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }
  // Mongoose duplicate key → 400
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "campo";
    return res.status(400).json({ message: `El ${field} ya está registrado` });
  }
  // ID malformado (ej. GET /api/products/no-es-un-id) → 400, no 500.
  // Sin este branch caía al catch-all de abajo, que filtraba el mensaje
  // crudo de Mongoose (nombre del modelo, path del schema) en la respuesta.
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Id inválido: ${err.value}` });
  }
  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
  // CORS rechazado → 403
  if (err.message?.startsWith("Origen no permitido por CORS")) {
    return res.status(403).json({ message: err.message });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

export default app;

