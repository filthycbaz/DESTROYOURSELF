import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { renderWithProviders } from "../test-utils/render";
import { mockProduct, mockProduct2 } from "../test-utils/msw/handlers";
import CartPage from "./CartPage";

// AppProvider persists the anonymous cart in localStorage under "cartData".
// Seeding it before render exercises the same read path the app uses on
// mount, and lets these tests run without an authenticated session.
function seedLocalCart(items) {
  localStorage.setItem("cartData", JSON.stringify(items));
}

const item1 = { ...mockProduct, size: "M", quantity: 2 };
const item2 = { ...mockProduct2, size: "30", quantity: 1 };

describe("CartPage", () => {
  test("carrito vacío muestra un mensaje y botón para ir a la tienda", () => {
    renderWithProviders(<CartPage />, { route: "/cart" });

    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ir a la tienda/i })
    ).toBeInTheDocument();
  });

  test("carrito con productos: persiste desde localStorage y calcula el subtotal", () => {
    seedLocalCart([item1, item2]);
    renderWithProviders(<CartPage />, { route: "/cart" });

    expect(screen.getByText(item1.name)).toBeInTheDocument();
    expect(screen.getByText(item2.name)).toBeInTheDocument();

    // subtotal = 350*2 + 500*1 = 1200
    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$1200 MXN");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("$1200 MXN");
  });

  test("incrementar y disminuir la cantidad de un item actualiza el subtotal", async () => {
    seedLocalCart([item1]);
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: "/cart" });

    const itemId = item1._id;
    await user.click(screen.getByTestId(`cart-item-increment-${itemId}-${item1.size}`));
    expect(screen.getByTestId(`cart-item-quantity-${itemId}-${item1.size}`)).toHaveTextContent("3");
    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$1050 MXN");

    await user.click(screen.getByTestId(`cart-item-decrement-${itemId}-${item1.size}`));
    expect(screen.getByTestId(`cart-item-quantity-${itemId}-${item1.size}`)).toHaveTextContent("2");
  });

  test("no permite bajar la cantidad por debajo de 1", async () => {
    seedLocalCart([{ ...item1, quantity: 1 }]);
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: "/cart" });

    const itemId = item1._id;
    await user.click(screen.getByTestId(`cart-item-decrement-${itemId}-${item1.size}`));

    expect(screen.getByTestId(`cart-item-quantity-${itemId}-${item1.size}`)).toHaveTextContent("1");
  });

  test("eliminar un producto lo quita del carrito", async () => {
    seedLocalCart([item1, item2]);
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { route: "/cart" });

    await user.click(
      screen.getByTestId(`cart-item-remove-${item1._id}-${item1.size}`)
    );

    expect(screen.queryByText(item1.name)).not.toBeInTheDocument();
    expect(screen.getByText(item2.name)).toBeInTheDocument();
  });

  test("proceder al pago sin sesión redirige a /login", async () => {
    // Nota: CartPage.jsx llama a setMessage(...) y navigate("/login") en el
    // mismo manejador de click; la navegación desmonta CartPage antes de
    // que el mensaje "Debes iniciar sesión" llegue a pintarse (defecto real,
    // ver docs/testing.md → Errores conocidos, DEF-02). Este test verifica
    // el comportamiento real: la redirección ocurre.
    seedLocalCart([item1]);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<div data-testid="mock-login-page" />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId("cart-checkout-button"));

    expect(await screen.findByTestId("mock-login-page")).toBeInTheDocument();
  });
});
