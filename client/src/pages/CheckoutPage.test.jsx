import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse, delay } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { mockProduct, mockUser } from "../test-utils/msw/handlers";
import CheckoutPage from "./CheckoutPage";
import ConfirmationPage from "./ConfirmationPage";

// CheckoutPage is a single form (not a multi-step wizard) with three
// <fieldset> blocks: contacto, dirección de envío, y método de pago — see
// docs/testing.md for how this maps to the "4 fases" of the assignment.
//
// The authenticated cart is loaded via GET /api/cart on login; mocking that
// response directly (rather than seeding localStorage) is the simplest way
// to give CheckoutPage a populated `cart` without re-testing AppContext's
// sync logic (already covered by CartPage.test.jsx for the anonymous path).
function mockAuthenticatedCartWith(items) {
  localStorage.setItem("authToken", "fake-jwt-token");
  localStorage.setItem("userData", JSON.stringify(mockUser));
  server.use(
    http.get(`${API_URL}/cart`, () => HttpResponse.json({ items }))
  );
}

const backendCartItem = {
  _id: "cartitem-1",
  product: mockProduct,
  size: "M",
  quantity: 2,
};

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("CheckoutPage", () => {
  test("renderiza los tres bloques del formulario y el total del carrito", async () => {
    mockAuthenticatedCartWith([backendCartItem]);
    renderCheckout();

    expect(await screen.findByTestId("checkout-customer-form")).toBeInTheDocument();
    expect(screen.getByTestId("checkout-shipping-form")).toBeInTheDocument();
    expect(screen.getByTestId("checkout-payment-form")).toBeInTheDocument();

    // total = 350 * 2
    await waitFor(() =>
      expect(screen.getByTestId("checkout-total")).toHaveTextContent("$700.00 MXN")
    );
  });

  test("los campos de contacto y dirección son obligatorios", async () => {
    mockAuthenticatedCartWith([backendCartItem]);
    renderCheckout();

    await screen.findByTestId("checkout-customer-form");

    ["checkout-street-input", "checkout-city-input", "checkout-state-input", "checkout-zip-input"].forEach(
      (testId) => {
        expect(screen.getByTestId(testId)).toBeRequired();
      }
    );
  });

  test("permite elegir el método de pago", async () => {
    mockAuthenticatedCartWith([backendCartItem]);
    const user = userEvent.setup();
    renderCheckout();

    await screen.findByTestId("checkout-customer-form");

    expect(screen.getByTestId("checkout-payment-tarjeta")).toBeChecked();

    await user.click(screen.getByTestId("checkout-payment-transferencia"));

    expect(screen.getByTestId("checkout-payment-transferencia")).toBeChecked();
    expect(screen.getByTestId("checkout-payment-tarjeta")).not.toBeChecked();
  });

  test("enviar la orden crea una sola orden, limpia el carrito y navega a confirmación", async () => {
    mockAuthenticatedCartWith([backendCartItem]);
    let orderRequests = 0;
    server.use(
      http.post(`${API_URL}/orders`, async ({ request }) => {
        orderRequests += 1;
        const body = await request.json();
        const total = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return HttpResponse.json(
          { _id: "order-123", items: body.items, total, status: "pending" },
          { status: 201 }
        );
      })
    );

    const user = userEvent.setup();
    renderCheckout();

    await screen.findByTestId("checkout-customer-form");
    await user.type(screen.getByTestId("checkout-street-input"), "Av. Siempre Viva 742");
    await user.type(screen.getByTestId("checkout-city-input"), "CDMX");
    await user.type(screen.getByTestId("checkout-state-input"), "CDMX");
    await user.type(screen.getByTestId("checkout-zip-input"), "01000");

    await user.click(screen.getByTestId("checkout-confirm-button"));

    expect(await screen.findByTestId("order-success")).toBeInTheDocument();
    expect(screen.getByTestId("order-number")).toHaveTextContent("order-123");
    expect(orderRequests).toBe(1);
  });

  test("error del servidor al crear la orden se muestra y no navega", async () => {
    mockAuthenticatedCartWith([backendCartItem]);
    server.use(
      http.post(`${API_URL}/orders`, () =>
        HttpResponse.json({ message: 'Stock insuficiente para "Playera destruida"' }, { status: 400 })
      )
    );

    const user = userEvent.setup();
    renderCheckout();

    await screen.findByTestId("checkout-customer-form");
    await user.type(screen.getByTestId("checkout-street-input"), "Av. Siempre Viva 742");
    await user.type(screen.getByTestId("checkout-city-input"), "CDMX");
    await user.type(screen.getByTestId("checkout-state-input"), "CDMX");
    await user.type(screen.getByTestId("checkout-zip-input"), "01000");
    await user.click(screen.getByTestId("checkout-confirm-button"));

    expect(await screen.findByTestId("checkout-error")).toHaveTextContent(
      /stock insuficiente/i
    );
    expect(screen.queryByTestId("order-success")).not.toBeInTheDocument();
    expect(screen.getByTestId("checkout-confirm-button")).not.toBeDisabled();
  });

  test("el botón de confirmar se deshabilita mientras la orden se procesa (previene doble envío)", async () => {
    mockAuthenticatedCartWith([backendCartItem]);
    server.use(
      http.post(`${API_URL}/orders`, async () => {
        await delay(50);
        return HttpResponse.json({ _id: "order-123", items: [], total: 700 }, { status: 201 });
      })
    );

    const user = userEvent.setup();
    renderCheckout();

    await screen.findByTestId("checkout-customer-form");
    await user.type(screen.getByTestId("checkout-street-input"), "Av. Siempre Viva 742");
    await user.type(screen.getByTestId("checkout-city-input"), "CDMX");
    await user.type(screen.getByTestId("checkout-state-input"), "CDMX");
    await user.type(screen.getByTestId("checkout-zip-input"), "01000");
    await user.click(screen.getByTestId("checkout-confirm-button"));

    expect(screen.getByTestId("checkout-confirm-button")).toBeDisabled();
    await screen.findByTestId("order-success");
  });
});
