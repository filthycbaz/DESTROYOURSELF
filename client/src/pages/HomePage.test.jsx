import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { renderWithProviders } from "../test-utils/render";
import { mockProducts } from "../test-utils/msw/handlers";
import HomePage from "./HomePage";
import ProductDetailPage from "./ProductDetailPage";

describe("HomePage", () => {
  test("muestra el estado de carga y luego el listado de productos", async () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument();

    expect(await screen.findByText(/playera destruida/i)).toBeInTheDocument();
    expect(screen.getByText(/pantalón cargo/i)).toBeInTheDocument();
    expect(screen.queryByText(/cargando productos/i)).not.toBeInTheDocument();
  });

  test("estado vacío: no hay productos disponibles", async () => {
    server.use(
      http.get(`${API_URL}/products`, () =>
        HttpResponse.json({ products: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
      )
    );

    renderWithProviders(<HomePage />);

    await screen.findByText(/todos/i);
    expect(screen.queryByText(/playera destruida/i)).not.toBeInTheDocument();
  });

  test("error de API muestra un mensaje al usuario", async () => {
    server.use(
      http.get(`${API_URL}/products`, () => HttpResponse.error())
    );

    renderWithProviders(<HomePage />);

    expect(
      await screen.findByText(/no se pudo conectar con el servidor/i)
    ).toBeInTheDocument();
  });

  test("filtra productos por categoría", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await screen.findByText(/playera destruida/i);
    expect(screen.getByText(/pantalón cargo/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^tops$/i }));

    expect(screen.getByText(/playera destruida/i)).toBeInTheDocument();
    expect(screen.queryByText(/pantalón cargo/i)).not.toBeInTheDocument();
  });

  test("hacer click en una tarjeta navega al detalle del producto", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const card = await screen.findByTestId(`product-card-${mockProducts[0]._id}`);
    await user.click(card);

    expect(await screen.findByTestId("product-detail")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /playera destruida/i })).toBeInTheDocument();
  });
});
