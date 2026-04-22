import express from "express";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, requireAdmin, createCategory);
router.delete("/:id", protect, requireAdmin, deleteCategory);

export default router;
