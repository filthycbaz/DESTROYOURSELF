import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import { renderWithProviders } from "../test-utils/render";
import LoginPage from "./LoginPage";

describe("LoginPage — modo login", () => {
  test("renderiza los campos de login y el enlace hacia registro", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("login-submit-button")).toBeInTheDocument();
    expect(screen.getByTestId("auth-toggle-mode-button")).toHaveTextContent(/regístrate/i);
  });

  test("los campos de email y contraseña son obligatorios (validación nativa HTML5)", () => {
    // No hay validación JS propia: el formulario depende del atributo
    // `required`. JSDOM no bloquea el submit como un navegador real, así
    // que el escenario "enviar formulario vacío" se cubre en Cypress
    // (navegador real) — aquí solo verificamos que el atributo exista.
    renderWithProviders(<LoginPage />, { route: "/login" });

    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/contraseña/i)).toBeRequired();
  });

  test("credenciales incorrectas muestran un mensaje de error y detienen el estado de carga", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "usuario@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "wrong-password");
    await user.click(screen.getByTestId("login-submit-button"));

    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      /email o contraseña incorrectos/i
    );
    expect(screen.getByTestId("login-submit-button")).not.toBeDisabled();
  });

  test("muestra estado de carga mientras se resuelve el login", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, async () => {
        await delay(50);
        return HttpResponse.json({
          token: "fake-jwt-token",
          user: { _id: "user-1", name: "Usuario Prueba", email: "usuario@example.com" },
        });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "usuario@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "Test1234!");
    await user.click(screen.getByTestId("login-submit-button"));

    expect(screen.getByTestId("login-submit-button")).toBeDisabled();

    await waitFor(() =>
      expect(localStorage.getItem("authToken")).toBe("fake-jwt-token")
    );
  });

  test("login exitoso guarda la sesión en localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "usuario@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "Test1234!");
    await user.click(screen.getByTestId("login-submit-button"));

    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBe("fake-jwt-token");
      expect(JSON.parse(localStorage.getItem("userData")).email).toBe(
        "usuario@example.com"
      );
    });
  });
});

describe("LoginPage — modo registro", () => {
  test("el toggle cambia a modo registro y muestra nombre + confirmar contraseña", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.click(screen.getByTestId("auth-toggle-mode-button"));

    expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByTestId("register-submit-button")).toHaveTextContent(
      /crear cuenta/i
    );
  });

  test("contraseñas que no coinciden muestran error y no llaman al servidor", async () => {
    let registerCalls = 0;
    server.use(
      http.post(`${API_URL}/auth/register`, () => {
        registerCalls += 1;
        return HttpResponse.json({ token: "x", user: {} }, { status: 201 });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });
    await user.click(screen.getByTestId("auth-toggle-mode-button"));

    await user.type(screen.getByLabelText(/^nombre$/i), "Nuevo Usuario");
    await user.type(screen.getByLabelText(/^email$/i), "nuevo@example.com");
    await user.type(screen.getByLabelText(/^contraseña$/i), "Test1234!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "OtraClave1!");
    await user.click(screen.getByTestId("register-submit-button"));

    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      /las contraseñas no coinciden/i
    );
    expect(registerCalls).toBe(0);
  });

  test("registro exitoso con un correo único guarda la sesión", async () => {
    const uniqueEmail = `cypress-${Date.now()}@example.com`;
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });
    await user.click(screen.getByTestId("auth-toggle-mode-button"));

    await user.type(screen.getByLabelText(/^nombre$/i), "Usuario Nuevo");
    await user.type(screen.getByLabelText(/^email$/i), uniqueEmail);
    await user.type(screen.getByLabelText(/^contraseña$/i), "Test1234!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "Test1234!");
    await user.click(screen.getByTestId("register-submit-button"));

    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBe("fake-jwt-token");
      expect(JSON.parse(localStorage.getItem("userData")).email).toBe(uniqueEmail);
    });
  });

  test("registro con correo ya existente muestra el error del servidor", async () => {
    server.use(
      http.post(`${API_URL}/auth/register`, () => {
        return HttpResponse.json(
          { message: "El email ya está registrado" },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });
    await user.click(screen.getByTestId("auth-toggle-mode-button"));

    await user.type(screen.getByLabelText(/^nombre$/i), "Usuario Repetido");
    await user.type(screen.getByLabelText(/^email$/i), "usuario@example.com");
    await user.type(screen.getByLabelText(/^contraseña$/i), "Test1234!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "Test1234!");
    await user.click(screen.getByTestId("register-submit-button"));

    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      /el email ya está registrado/i
    );
    expect(screen.getByTestId("register-submit-button")).not.toBeDisabled();
  });
});
