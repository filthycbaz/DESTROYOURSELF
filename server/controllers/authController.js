// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// REGISTER
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verificar si el email ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // 2. Crear usuario — el hook pre("save") hashea la contraseña
    const user = await User.create({ name, email, password });

    // 3. Generar JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4. user.toJSON() ya elimina el password automáticamente
    res.status(201).json({ token, user });

  } catch (error) {
    next(error);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario — necesitamos el password para comparar
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Email o contraseña incorrectos" });
    }

    // 2. Verificar contraseña con el método del model
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Email o contraseña incorrectos" });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token, user });

  } catch (error) {
    next(error);
  }
};

// GET ME — obtener usuario autenticado
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe };


