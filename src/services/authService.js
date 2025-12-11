import { getUserByEmail } from "./userService";

const validCredentials = {
  "cbaz2080@gmail.com": "123456",
  "admin@example.com": "admin123",
};

export async function login(email, password) {
  // 1. Validar credenciales
  const validPassword = validCredentials[email];

  if (!validPassword || validPassword !== password) {
    return {
      success: false,
      message: "Email o contraseña incorrectos",
    };
  }

  // 2. Obtener user completo
  const user = await getUserByEmail(email);

  if (!user) {
    return {
      success: false,
      message: "Usuario no encontrado",
    };
  }

  // 3. Generar token simulado
  const token = btoa(`${email}-${Date.now()}`);

  // 4. Crear objeto usuario con metadata
  const userData = {
    ...user,
    loginDate: new Date().toISOString(),
  };

  // 5. Guardar en localStorage
  localStorage.setItem("authToken", token);
  localStorage.setItem("userData", JSON.stringify(userData));

  return { success: true, user: userData };
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
}

export function getCurrentUser() {
  const data = localStorage.getItem("userData");
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}
