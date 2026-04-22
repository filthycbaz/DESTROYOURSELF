import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    // Guardamos la ruta actual para volver después del login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
