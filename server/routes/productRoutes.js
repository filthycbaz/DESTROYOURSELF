// routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas públicas — cualquiera puede ver productos
router.get("/", getProducts);
router.get("/:id", getProductById);

// Rutas protegidas — solo admin puede modificar
router.post("/", protect, requireAdmin, createProduct);
router.put("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

export default router;
