import products from "../../fixtures/products.json";
import { uniqueAddress } from "../../utils/testData";

// CheckoutPage no es un wizard de 4 pasos: es UN solo formulario con tres
// <fieldset> (contacto, dirección, método de pago) enviado de una sola vez.
// Este spec organiza las aserciones en 4 bloques funcionales equivalentes a
// los pedidos por el enunciado — ver docs/testing.md para el detalle de
// cómo se mapea cada fase a la UI real.
//
// Todas las navegaciones hacia /checkout y /orders ocurren por click en la
// UI (nunca cy.visit directo) porque un hard visit a una ruta protegida con
// sesión ya guardada en localStorage también redirige a /login — ver
// docs/testing.md → Errores conocidos, DEF-03.
describe("Checkout", () => {
  const address = uniqueAddress();

  beforeEach(() => {
    cy.loginByApi();
    cy.visit("/");
    cy.clearCartByApi();
    // quantity: 1 — el producto usado (SUETER NEWSHOP TINTO) tiene stock
    // limitado en el seed (5) y varios tests de "Bloque 4" completan una
    // orden real contra el backend; usar 1 evita que la suite se quede sin
    // stock al correr todos los tests en secuencia.
    cy.addProductToCart({
      productName: products.checkoutProduct.name,
      size: products.checkoutProduct.size,
      quantity: 1,
    });
  });

  context("Bloque 1 — Carrito y productos", () => {
    it("muestra el producto agregado con nombre, precio, cantidad y subtotal correcto", () => {
      cy.getByTestId("header-cart-link").click();
      cy.location("pathname").should("eq", "/cart");

      cy.contains(products.checkoutProduct.name).should("be.visible");
      cy.contains(`Talla: ${products.checkoutProduct.size}`).should("be.visible");

      cy.get(".cart-item-quantity").should("contain.text", "1");
      cy.getByTestId("cart-subtotal").should("be.visible");
      cy.getByTestId("cart-checkout-button").should("be.visible").and("contain.text", "PROCEDER AL PAGO");
    });

    it("modificar la cantidad actualiza el subtotal", () => {
      cy.getByTestId("header-cart-link").click();

      cy.get(".cart-item-quantity-button").last().click(); // último botón = incrementar (Plus)
      cy.get(".cart-item-quantity").should("contain.text", "2");
      cy.getByTestId("cart-subtotal").should("contain.text", "$900 MXN"); // 450 * 2
    });

    it("eliminar el producto deja el carrito vacío y previene llegar al checkout (no hay botón de pago)", () => {
      cy.getByTestId("header-cart-link").click();
      cy.get(".cart-item-remove-button").click();

      cy.contains(/tu carrito está vacío/i).should("be.visible");
      cy.getByTestId("cart-checkout-button").should("not.exist");
    });
  });

  context("Bloque 2 — Datos del cliente y dirección de envío", () => {
    beforeEach(() => {
      cy.getByTestId("header-cart-link").click();
      cy.getByTestId("cart-checkout-button").click();
      cy.location("pathname").should("eq", "/checkout");
    });

    it("precarga nombre y email del usuario autenticado", () => {
      cy.getByTestId("checkout-name-input").should("not.have.value", "");
      cy.getByTestId("checkout-email-input").should("have.value", Cypress.env("TEST_USER_EMAIL"));
    });

    it("los campos de dirección son obligatorios", () => {
      ["checkout-street-input", "checkout-city-input", "checkout-state-input", "checkout-zip-input"].forEach(
        (testId) => {
          cy.getByTestId(testId).then(($el) => {
            expect($el[0].validity.valueMissing, `${testId} debe ser required`).to.be.true;
          });
        }
      );
    });

    it("los valores capturados se conservan mientras se completa el resto del formulario", () => {
      cy.getByTestId("checkout-street-input").type(address.street);
      cy.getByTestId("checkout-city-input").type(address.city);
      cy.getByTestId("checkout-street-input").should("have.value", address.street);

      cy.getByTestId("checkout-state-input").type(address.state);
      cy.getByTestId("checkout-city-input").should("have.value", address.city);
    });
  });

  context("Bloque 3 — Envío y pago", () => {
    beforeEach(() => {
      cy.getByTestId("header-cart-link").click();
      cy.getByTestId("cart-checkout-button").click();
      cy.location("pathname").should("eq", "/checkout");
    });

    it("tarjeta es el método de pago seleccionado por defecto y el total se muestra", () => {
      cy.getByTestId("checkout-payment-tarjeta").should("be.checked");
      cy.getByTestId("checkout-total").should("contain.text", "$450.00 MXN");
    });

    it("permite cambiar el método de pago entre tarjeta, transferencia y efectivo", () => {
      // El <input type="radio"> real está oculto (display: none) y se
      // sustituye visualmente por su <label>; el usuario hace click en el
      // label, no en el input.
      cy.contains(".payment-method-option", /transferencia bancaria/i).click();
      cy.getByTestId("checkout-payment-transferencia").should("be.checked");

      cy.contains(".payment-method-option", /pago en efectivo/i).click();
      cy.getByTestId("checkout-payment-efectivo").should("be.checked");
      cy.getByTestId("checkout-payment-transferencia").should("not.be.checked");
    });

    it("un error del servidor al confirmar se muestra y no deja el botón cargando para siempre", () => {
      cy.intercept("POST", "**/orders", {
        statusCode: 400,
        body: { message: 'Stock insuficiente para "SUETER NEWSHOP TINTO"' },
      }).as("createOrderFailed");

      fillAddress(address);
      cy.getByTestId("checkout-confirm-button").click();

      cy.wait("@createOrderFailed");
      cy.getByTestId("checkout-error").invoke("text").should("match", /stock insuficiente/i);
      cy.getByTestId("checkout-confirm-button").should("not.be.disabled");
    });
  });

  context("Bloque 4 — Revisión y confirmación", () => {
    beforeEach(() => {
      cy.intercept("POST", "**/orders").as("createOrder");
      cy.getByTestId("header-cart-link").click();
      cy.getByTestId("cart-checkout-button").click();
      cy.location("pathname").should("eq", "/checkout");
      fillAddress(address);
    });

    it("confirmar la orden crea UNA sola orden con el payload esperado y navega a confirmación", () => {
      cy.getByTestId("checkout-confirm-button").click();

      cy.wait("@createOrder").then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        expect(interception.request.body.paymentMethod).to.eq("tarjeta");
        expect(interception.request.body.shippingAddress.city).to.eq(address.city);
        expect(interception.request.body.items).to.have.length(1);
        expect(interception.request.body.items[0].quantity).to.eq(1);
      });

      cy.get("@createOrder.all").should("have.length", 1);

      cy.location("pathname").should("eq", "/confirmation");
      cy.getByTestId("order-success").should("be.visible");
      cy.getByTestId("order-number").should("not.be.empty");
      cy.contains(products.checkoutProduct.name).should("be.visible");
      cy.contains(/total/i).should("be.visible");
    });

    it("el carrito queda vacío después de confirmar la compra", () => {
      cy.getByTestId("checkout-confirm-button").click();
      cy.wait("@createOrder");
      cy.getByTestId("order-success").should("be.visible");

      cy.getByTestId("header-cart-link").click();
      cy.contains(/tu carrito está vacío/i).should("be.visible");
    });

    it("recargar la página de confirmación no reenvía ni duplica la orden", () => {
      cy.getByTestId("checkout-confirm-button").click();
      cy.wait("@createOrder");
      cy.get("@createOrder.all").should("have.length", 1);

      // ConfirmationPage lee location.state (no localStorage). Recargar la
      // MISMA entrada de historial conserva history.state en el navegador,
      // así que la orden sigue visible tras el reload — pero lo importante
      // es que no existe ningún mecanismo (form POST, resubmit) que pueda
      // reenviar la petición: es una SPA, el reload solo vuelve a renderizar
      // desde el estado ya guardado, nunca repite el fetch de creación.
      cy.reload();
      cy.getByTestId("order-success").should("be.visible");
      cy.get("@createOrder.all").should("have.length", 1);
    });

    it("el botón de confirmar se deshabilita mientras se procesa (evita doble envío / doble click)", () => {
      cy.intercept("POST", "**/orders", (req) => {
        req.reply((res) => {
          res.setDelay(300);
          res.send({
            statusCode: 201,
            body: { _id: "order-double-click", items: [], total: 900, status: "pending" },
          });
        });
      }).as("createOrderSlow");

      cy.getByTestId("checkout-confirm-button").click();
      cy.getByTestId("checkout-confirm-button").should("be.disabled");

      cy.wait("@createOrderSlow");
      cy.get("@createOrderSlow.all").should("have.length", 1);
    });
  });
});

function fillAddress(address) {
  cy.getByTestId("checkout-street-input").clear().type(address.street);
  cy.getByTestId("checkout-city-input").clear().type(address.city);
  cy.getByTestId("checkout-state-input").clear().type(address.state);
  cy.getByTestId("checkout-zip-input").clear().type(address.zip);
}
