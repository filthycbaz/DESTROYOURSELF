// services/authService.js

const API_URL = "http://localhost:3001/api";

// LOGIN
export async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Error al iniciar sesión" };
    }

    // El back devuelve { token, user }
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userData", JSON.stringify(data.user));

    return { success: true, user: data.user };

  } catch (error) {
    return { success: false, message: "No se pudo conectar con el servidor" };
  }
}

// REGISTER
export async function register(name, email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Error al crear cuenta" };
    }

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userData", JSON.stringify(data.user));

    return { success: true, user: data.user };

  } catch (error) {
    return { success: false, message: "No se pudo conectar con el servidor" };
  }
}

// LOGOUT
export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
}

// HELPERS — estos no cambian
export function getCurrentUser() {
  const data = localStorage.getItem("userData");
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

// NUEVO — para requests autenticados a otras rutas
export function getAuthHeader() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}