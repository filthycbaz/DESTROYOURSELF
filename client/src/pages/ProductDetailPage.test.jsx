import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import { renderWithProviders } from "../test-utils/render";
import { mockProduct } from "../test-utils/msw/handlers";
import ProductDetailPage from "./ProductDetailPage";

describe("ProductDetailPage", () => {
  test("muestra el estado de carga y luego el detalle del producto", async () => {
    renderWithProviders(<ProductDetailPage />, { route: `/product/${mockProduct._id}`, path: "/product/:id" });

    expect(screen.getByText(/cargando producto/i)).toBeInTheDocument();

    expect(await screen.findByTestId("product-detail")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /playera destruida/i })).toBeInTheDocument();
    expect(screen.getByText(/\$350 mxn/i)).toBeInTheDocument();
    mockProduct.sizes.forEach((size) => {
      expect(screen.getByTestId(`size-option-${size}`)).toBeInTheDocument();
    });
  });

  test("producto inexistente muestra un mensaje de no encontrado", async () => {
    renderWithProviders(<ProductDetailPage />, { route: "/product/no-existe", path: "/product/:id" });

    expect(
      await screen.findByRole("heading", { name: /producto no encontrado/i })
    ).toBeInTheDocument();
  });

  test("error de red muestra un mensaje de no encontrado", async () => {
    server.use(
      http.get(`${API_URL}/products/:id`, () => HttpResponse.error())
    );

    renderWithProviders(<ProductDetailPage />, { route: `/product/${mockProduct._id}`, path: "/product/:id" });

    expect(
      await screen.findByRole("heading", { name: /producto no encontrado/i })
    ).toBeInTheDocument();
  });

  test("agregar al carrito sin talla seleccionada muestra un mensaje", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductDetailPage />, { route: `/product/${mockProduct._id}`, path: "/product/:id" });

    await screen.findByTestId("product-detail");
    await user.click(screen.getByTestId("add-to-cart-button"));

    expect(await screen.findByTestId("add-to-cart-message")).toHaveTextContent(
      /selecciona una talla/i
    );
  });

  test("seleccionar talla y agregar al carrito confirma el mensaje de éxito", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductDetailPage />, { route: `/product/${mockProduct._id}`, path: "/product/:id" });

    await screen.findByTestId("product-detail");
    await user.click(screen.getByTestId(`size-option-${mockProduct.sizes[0]}`));
    await user.click(screen.getByTestId("add-to-cart-button"));

    expect(await screen.findByTestId("add-to-cart-message")).toHaveTextContent(
      /producto agregado al carrito/i
    );
  });
});
