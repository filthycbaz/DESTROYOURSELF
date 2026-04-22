import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getCart, addItem, updateItem, removeItem, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.use(protect); // todos los endpoints requieren auth

router.get("/", getCart);
router.post("/", addItem);
router.put("/:itemId", updateItem);
router.delete("/:itemId", removeItem);
router.delete("/", clearCart);

export default router;
