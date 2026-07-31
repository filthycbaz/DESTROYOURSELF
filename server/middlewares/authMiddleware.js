import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logSecurityEvent from "../config/securityLog.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logSecurityEvent("auth.no_token", { ip: req.ip, path: req.path });
      return res.status(401).json({ message: "No autorizado, token requerido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      logSecurityEvent("auth.inactive_or_missing_user", {
        ip: req.ip,
        path: req.path,
        userId: decoded.id,
      });
      return res.status(401).json({ message: "Usuario no encontrado o inactivo" });
    }

    req.user = user;
    next();
  } catch (error) {
    logSecurityEvent("auth.invalid_token", { ip: req.ip, path: req.path, error: error.name });
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// requireAdmin siempre va después de protect
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    logSecurityEvent("auth.forbidden", {
      ip: req.ip,
      path: req.path,
      userId: req.user._id,
      role: req.user.role,
    });
    return res.status(403).json({ message: "Acceso restringido a administradores" });
  }
  next();
};

export { protect, requireAdmin };
