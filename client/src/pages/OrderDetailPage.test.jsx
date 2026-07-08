import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils/render";
import { mockOrder } from "../test-utils/msw/handlers";
import OrderDetailPage from "./OrderDetailPage";

describe("OrderDetailPage", () => {
  test("muestra el estado de carga y luego el detalle del pedido", async () => {
    renderWithProviders(<OrderDetailPage />, {
      route: `/orders/${mockOrder._id}`,
      path: "/orders/:id",
    });

    expect(screen.getByText(/cargando pedido/i)).toBeInTheDocument();

    expect(await screen.findByText(/^pedido$/i)).toBeInTheDocument();
    expect(screen.getByText(`# ${mockOrder._id.slice(-8).toUpperCase()}`)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.items[0].name)).toBeInTheDocument();
    expect(screen.getByText(/talla: m · cantidad: 2/i)).toBeInTheDocument();
    // Aparece dos veces: el importe de la línea del producto y el total de la
    // orden coinciden en valor ($350 x 2 = $700 = order.total).
    expect(screen.getAllByText("$700.00 MXN")).toHaveLength(2);
  });

  test("pedido inexistente (404) muestra un mensaje de error genérico", async () => {
    // OrderDetailPage.jsx atrapa el 404 en el mismo catch que un error de red y
    // siempre muestra "No se pudo cargar el pedido" — no hay un mensaje
    // específico de "no encontrado" distinto del de error genérico.
    renderWithProviders(<OrderDetailPage />, {
      route: "/orders/no-existe",
      path: "/orders/:id",
    });

    expect(await screen.findByText(/no se pudo cargar el pedido/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver a mis pedidos/i })).toBeInTheDocument();
  });
});
