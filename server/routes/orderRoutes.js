// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin — va ANTES de /:id para que no lo intercepte
router.get("/all", protect, requireAdmin, getAllOrders);
router.patch("/:id/status", protect, requireAdmin, updateOrderStatus);

// Usuario autenticado
router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

export default router;