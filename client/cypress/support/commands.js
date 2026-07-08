// ─────────────────────────────────────────────────────────────
// Helpers genéricos
// ─────────────────────────────────────────────────────────────
Cypress.Commands.add("getByTestId", (testId, options) => {
  return cy.get(`[data-testid="${testId}"]`, options);
});

// ─────────────────────────────────────────────────────────────
// cy.loginByApi({ email, password })
//
// Inicia sesión directamente contra POST /api/auth/login (evita pasar por
// la UI en los tests que no están probando el formulario de login en sí).
// La app guarda la sesión en localStorage (authToken / userData), no en
// cookies, así que hay que estar en el origin de la app (cy.visit) antes
// de escribir en localStorage para que persista.
// ─────────────────────────────────────────────────────────────
Cypress.Commands.add("loginByApi", (credentials = {}) => {
  const email = credentials.email || Cypress.env("TEST_USER_EMAIL");
  const password = credentials.password || Cypress.env("TEST_USER_PASSWORD");
  const apiUrl = Cypress.env("apiUrl");

  cy.session(
    ["loginByApi", email],
    () => {
      cy.visit("/");
      cy.request({
        method: "POST",
        url: `${apiUrl}/auth/login`,
        body: { email, password },
        log: false,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          throw new Error(
            `cy.loginByApi: el login falló con status ${response.status} — ${
              response.body?.message || "sin mensaje del servidor"
            }`
          );
        }
        window.localStorage.setItem("authToken", response.body.token);
        window.localStorage.setItem("userData", JSON.stringify(response.body.user));
      });
    },
    {
      validate() {
        cy.window().then((win) => {
          expect(win.localStorage.getItem("authToken")).to.exist;
        });
      },
    }
  );
});

// ─────────────────────────────────────────────────────────────
// cy.clearCartByApi()
//
// El carrito de un usuario autenticado vive en MongoDB (colección carts),
// no en localStorage, y cy.session() solo restaura almacenamiento del
// navegador — no resetea datos del servidor. Como los tests de checkout
// reutilizan el mismo usuario sembrado (para no depender de un endpoint de
// registro por test), hay que vaciar su carrito al inicio de cada test para
// que sean independientes entre sí (ver docs/testing.md "Limitaciones de
// limpieza de datos").
// ─────────────────────────────────────────────────────────────
Cypress.Commands.add("clearCartByApi", () => {
  const apiUrl = Cypress.env("apiUrl");

  cy.window().then((win) => {
    const token = win.localStorage.getItem("authToken");
    expect(token, "clearCartByApi requiere haber llamado a cy.loginByApi() antes").to.exist;

    cy.request({
      method: "DELETE",
      url: `${apiUrl}/cart`,
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});

// ─────────────────────────────────────────────────────────────
// cy.addProductToCart({ productName, size, quantity })
//
// Agrega un producto desde la UI real (ProductDetailPage): busca el
// producto por nombre vía la API para resolver su _id real (los ids son
// generados por Mongo en el seed, no son estables entre entornos), navega
// a /product/:id, selecciona talla y hace click en "AGREGAR AL CARRITO".
//
// Nota: ProductDetailPage no tiene un input de cantidad — para quantity > 1
// se hace click en el botón repetidas veces, igual que haría un usuario.
//
// Defecto conocido (ver docs/testing.md DEF-01): el botón "Agregar al
// carrito" de ProductCard en el listado NO agrega al carrito, solo navega
// al detalle. Por eso este comando usa ProductDetailPage, el único flujo
// que realmente agrega productos.
// ─────────────────────────────────────────────────────────────
Cypress.Commands.add("addProductToCart", ({ productName, size, quantity = 1 } = {}) => {
  const apiUrl = Cypress.env("apiUrl");

  cy.request(`${apiUrl}/products?limit=100`).then(({ body }) => {
    const product = body.products.find((p) => p.name === productName);
    expect(product, `producto "${productName}" debe existir (¿corriste npm run seed?)`).to.exist;

    cy.visit(`/product/${product._id}`);
    cy.getByTestId("product-detail").should("be.visible");
    cy.getByTestId(`size-option-${size}`).click();

    for (let i = 0; i < quantity; i += 1) {
      cy.getByTestId("add-to-cart-button").click();
    }

    cy.getByTestId("add-to-cart-message").should("contain.text", "Producto agregado al carrito");
    cy.getByTestId("cart-count").should("contain.text", String(quantity));

    cy.wrap(product).as("cartProduct");
  });
});
