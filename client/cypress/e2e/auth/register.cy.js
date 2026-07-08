import { uniqueTestUser } from "../../utils/testData";

describe("Registro", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/register").as("registerRequest");
    cy.visit("/login");
    // No existe una ruta /register separada: LoginPage alterna entre modo
    // login/registro con un botón en la misma página.
    cy.getByTestId("auth-toggle-mode-button").click();
  });

  it("renderiza el formulario de registro completo", () => {
    cy.findByLabelText(/^nombre$/i).should("be.visible");
    cy.findByLabelText(/^email$/i).should("be.visible");
    cy.findByLabelText(/^contraseña$/i).should("be.visible");
    cy.findByLabelText(/confirmar contraseña/i).should("be.visible");
    cy.getByTestId("register-submit-button").should("contain.text", "CREAR CUENTA");
    cy.getByTestId("auth-toggle-mode-button").invoke("text").should("match", /inicia sesión/i);
  });

  it("no envía la petición si los campos requeridos están vacíos", () => {
    cy.getByTestId("register-submit-button").click();

    cy.get("@registerRequest.all").should("have.length", 0);
  });

  it("correo con formato inválido bloquea el envío", () => {
    const user = uniqueTestUser("invalid-email");
    cy.findByLabelText(/^nombre$/i).type(user.name);
    cy.findByLabelText(/^email$/i).type("correo-sin-arroba");
    cy.findByLabelText(/^contraseña$/i).type(user.password);
    cy.findByLabelText(/confirmar contraseña/i).type(user.password);
    cy.getByTestId("register-submit-button").click();

    cy.get("@registerRequest.all").should("have.length", 0);
  });

  it("contraseñas diferentes muestran un error y no envían la petición", () => {
    const user = uniqueTestUser("mismatch");
    cy.findByLabelText(/^nombre$/i).type(user.name);
    cy.findByLabelText(/^email$/i).type(user.email);
    cy.findByLabelText(/^contraseña$/i).type(user.password);
    cy.findByLabelText(/confirmar contraseña/i).type("OtraClave1!");
    cy.getByTestId("register-submit-button").click();

    cy.getByTestId("auth-error").should("contain.text", "Las contraseñas no coinciden");
    cy.get("@registerRequest.all").should("have.length", 0);
  });

  it("registro exitoso con un correo único crea la cuenta y deja la sesión iniciada", () => {
    const user = uniqueTestUser("register-ok");

    cy.findByLabelText(/^nombre$/i).type(user.name);
    cy.findByLabelText(/^email$/i).type(user.email);
    cy.findByLabelText(/^contraseña$/i).type(user.password);
    cy.findByLabelText(/confirmar contraseña/i).type(user.password);
    cy.getByTestId("register-submit-button").click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 201);

    // La app no pide un login separado tras registrarse: AuthContext guarda
    // la sesión inmediatamente y LoginPage navega a la home.
    cy.location("pathname").should("eq", "/");
    cy.get(".header-logout-button").should("contain.text", "SALIR");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("authToken")).to.exist;
      expect(JSON.parse(win.localStorage.getItem("userData")).email).to.eq(user.email);
    });
  });

  it("registrar un correo ya existente muestra el error del servidor sin quedar cargando indefinidamente", () => {
    cy.findByLabelText(/^nombre$/i).type("Usuario Repetido");
    cy.findByLabelText(/^email$/i).type(Cypress.env("TEST_USER_EMAIL"));
    cy.findByLabelText(/^contraseña$/i).type("Test1234!");
    cy.findByLabelText(/confirmar contraseña/i).type("Test1234!");
    cy.getByTestId("register-submit-button").click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 400);
    cy.getByTestId("auth-error").should("contain.text", "El email ya está registrado");
    cy.getByTestId("register-submit-button").should("not.be.disabled").and("contain.text", "CREAR CUENTA");
  });
});
