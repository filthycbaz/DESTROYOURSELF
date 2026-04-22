// routes/categoryRoutes.js
import express from "express";
import Category from "../models/Category.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET ALL — público
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

// GET ONE — público
router.get("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

// POST — solo admin
router.post("/", protect, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// DELETE — solo admin
router.delete("/:id", protect, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;