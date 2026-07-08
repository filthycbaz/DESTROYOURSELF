import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { renderWithProviders } from "../test-utils/render";
import { mockOrder } from "../test-utils/msw/handlers";
import OrdersPage from "./OrdersPage";
import OrderDetailPage from "./OrderDetailPage";

describe("OrdersPage", () => {
  test("muestra el estado de carga y luego la lista vacía", async () => {
    renderWithProviders(<OrdersPage />, { route: "/orders" });

    expect(screen.getByText(/cargando pedidos/i)).toBeInTheDocument();

    expect(await screen.findByText(/sin pedidos/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir a la tienda/i })).toBeInTheDocument();
  });

  test("muestra la lista de pedidos cuando el usuario tiene órdenes", async () => {
    server.use(
      http.get(`${API_URL}/orders/me`, () => HttpResponse.json([mockOrder]))
    );

    renderWithProviders(<OrdersPage />, { route: "/orders" });

    expect(await screen.findByText(/mis pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(`# ${mockOrder._id.slice(-8).toUpperCase()}`)).toBeInTheDocument();
    expect(screen.getByText("$700.00 MXN")).toBeInTheDocument();
  });

  test("error de API muestra un mensaje", async () => {
    server.use(
      http.get(`${API_URL}/orders/me`, () => HttpResponse.error())
    );

    renderWithProviders(<OrdersPage />, { route: "/orders" });

    expect(
      await screen.findByText(/no se pudo conectar con el servidor/i)
    ).toBeInTheDocument();
  });

  test("hacer click en un pedido navega al detalle", async () => {
    server.use(
      http.get(`${API_URL}/orders/me`, () => HttpResponse.json([mockOrder]))
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/orders"]}>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const link = await screen.findByText(`# ${mockOrder._id.slice(-8).toUpperCase()}`);
    await user.click(link);

    expect(await screen.findByText(/^pedido$/i)).toBeInTheDocument();
  });
});
