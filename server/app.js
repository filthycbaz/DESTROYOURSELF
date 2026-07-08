
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

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
  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

export default app;

