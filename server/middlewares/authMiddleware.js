// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    // 1. Verificar que viene el token en el header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No autorizado, token requerido" });
    }

    // 2. Extraer el token
    const token = authHeader.split(" ")[1];

    // 3. Verificar y decodificar
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar el usuario en DB y adjuntarlo al request
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "Usuario no encontrado o inactivo" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware de rol — se usa después de protect
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso restringido a administradores" });
  }
  next();
};

export { protect, requireAdmin };
