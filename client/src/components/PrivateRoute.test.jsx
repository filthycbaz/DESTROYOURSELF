import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import PrivateRoute from "./PrivateRoute";

function renderProtected(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <div data-testid="protected-content">Contenido protegido</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("PrivateRoute", () => {
  test("sin sesión redirige a /login y no muestra datos privados", () => {
    renderProtected("/checkout");

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  // DEFECTO REAL (ver docs/testing.md → Errores conocidos, DEF-03):
  // AuthContext inicializa `auth` en `false` y solo lo actualiza a `true`
  // dentro de un useEffect que corre DESPUÉS del primer render. PrivateRoute
  // evalúa `auth` en ese primer render y ya redirige a /login antes de que
  // el efecto se ejecute, así que un usuario con sesión válida que entra
  // directo a una ruta protegida (o recarga la página) es expulsado a
  // /login aunque su token siga siendo válido. Este test documenta el
  // comportamiento real actual, no el esperado.
  test("con sesión ya guardada en localStorage, sigue redirigiendo a /login en el primer render (defecto)", () => {
    localStorage.setItem("authToken", "fake-jwt-token");
    localStorage.setItem("userData", JSON.stringify({ _id: "user-1", name: "Usuario Prueba" }));

    renderProtected("/checkout");

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });
});
