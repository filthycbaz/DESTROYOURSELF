import express from "express";
import { body } from "express-validator";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("El nombre es requerido"),
    body("email").isEmail().withMessage("El email no es válido").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("El email no es válido").normalizeEmail(),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  validate,
  login
);

router.get("/me", protect, getMe);

export default router;
