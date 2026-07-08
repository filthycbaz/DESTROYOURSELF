import users from "../../fixtures/users.json";

describe("Login", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/login").as("loginRequest");
    cy.visit("/login");
  });

  it("renderiza los campos de login y el enlace hacia registro", () => {
    cy.findByLabelText(/email/i).should("be.visible");
    cy.findByLabelText(/contraseña/i).should("be.visible");
    cy.getByTestId("login-submit-button").should("be.visible").and("contain.text", "CONTINUAR");
    cy.getByTestId("auth-toggle-mode-button").invoke("text").should("match", /regístrate/i);
    // No existe un flujo de "recuperar contraseña" en la app real — no se prueba.
  });

  it("no envía la petición si los campos requeridos están vacíos", () => {
    cy.getByTestId("login-submit-button").click();

    cy.get("@loginRequest.all").should("have.length", 0);
    cy.findByLabelText(/email/i).then(($el) => {
      expect($el[0].validity.valid, "el input de email debe ser inválido (required)").to.be.false;
    });
  });

  it("correo con formato inválido bloquea el envío (validación nativa del navegador)", () => {
    cy.findByLabelText(/email/i).type("no-es-un-correo");
    cy.findByLabelText(/contraseña/i).type("cualquier-cosa");
    cy.getByTestId("login-submit-button").click();

    cy.get("@loginRequest.all").should("have.length", 0);
    cy.findByLabelText(/email/i).then(($el) => {
      expect($el[0].validity.valid, "el input de email debe rechazar el formato").to.be.false;
    });
  });

  it("credenciales incorrectas muestran un error del servidor y no dejan sesión iniciada", () => {
    cy.findByLabelText(/email/i).type(users.invalidCredentials.email);
    cy.findByLabelText(/contraseña/i).type(users.invalidCredentials.password);
    cy.getByTestId("login-submit-button").click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    cy.getByTestId("auth-error").should("contain.text", "Email o contraseña incorrectos");
    cy.getByTestId("login-submit-button").should("not.be.disabled");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("authToken")).to.be.null;
    });
  });

  it("login exitoso redirige a la tienda y muestra al usuario autenticado", () => {
    cy.findByLabelText(/email/i).type(Cypress.env("TEST_USER_EMAIL"));
    cy.findByLabelText(/contraseña/i).type(Cypress.env("TEST_USER_PASSWORD"));
    cy.getByTestId("login-submit-button").click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
    cy.location("pathname").should("eq", "/");
    cy.get(".header-logout-button").should("contain.text", "SALIR");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("authToken")).to.exist;
    });
  });

  it("la sesión persiste tras recargar y al navegar a una ruta protegida por la UI", () => {
    cy.findByLabelText(/email/i).type(Cypress.env("TEST_USER_EMAIL"));
    cy.findByLabelText(/contraseña/i).type(Cypress.env("TEST_USER_PASSWORD"));
    cy.getByTestId("login-submit-button").click();
    cy.wait("@loginRequest");
    cy.location("pathname").should("eq", "/");

    cy.reload();
    cy.get(".header-logout-button", { timeout: 10000 }).should("contain.text", "SALIR");

    // Navegación por click (no cy.visit) hacia una ruta protegida: la sesión
    // ya se resolvió en un render anterior, así que PrivateRoute no expulsa
    // al usuario.
    cy.contains(".header-nav-link", /mis pedidos/i).click();
    cy.location("pathname").should("eq", "/orders");
    cy.location("pathname").should("not.eq", "/login");
  });

  it(
    "[DEFECTO DEF-03] navegar directamente (hard visit) a una ruta protegida " +
      "con sesión ya guardada en localStorage igual redirige a /login",
    () => {
      cy.findByLabelText(/email/i).type(Cypress.env("TEST_USER_EMAIL"));
      cy.findByLabelText(/contraseña/i).type(Cypress.env("TEST_USER_PASSWORD"));
      cy.getByTestId("login-submit-button").click();
      cy.wait("@loginRequest");

      // AuthContext inicializa `auth` en false y solo lo pone en true dentro
      // de un useEffect que corre después del primer render. En un hard
      // visit, PrivateRoute ya evaluó (y redirigió) antes de que ese efecto
      // corra — ver docs/testing.md → Errores conocidos, DEF-03.
      cy.visit("/orders");
      cy.location("pathname").should("eq", "/login");
    }
  );

  it("protección de rutas: sin sesión, visitar una ruta protegida redirige a /login sin mostrar datos privados", () => {
    cy.clearAllLocalStorage();
    cy.visit("/orders");

    cy.location("pathname").should("eq", "/login");
    cy.getByTestId("login-form").should("be.visible");
    // Contenido propio de OrdersPage (protegido) — no debe llegar a pintarse.
    cy.contains(/sin pedidos/i).should("not.exist");
    cy.get("h1").contains(/mis pedidos/i).should("not.exist");
  });
});
