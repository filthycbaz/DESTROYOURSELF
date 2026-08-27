import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import ErrorBoundary from "./ErrorBoundary";

const Bomb = () => {
  throw new Error("boom");
};

describe("ErrorBoundary", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // React logs el error de renderizado a console.error por su cuenta —
    // lo silenciamos para no ensuciar el output, no porque no nos importe.
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("un error de render muestra el fallback, no tumba la app", () => {
    render(
      <ErrorBoundary section="test" fallback={<p>Fallback de prueba</p>}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText("Fallback de prueba")).toBeInTheDocument();
  });

  test("no renderiza nada del fallback cuando no hay error", () => {
    render(
      <ErrorBoundary section="test" fallback={<p>Fallback de prueba</p>}>
        <p>Contenido normal</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("Contenido normal")).toBeInTheDocument();
    expect(screen.queryByText("Fallback de prueba")).not.toBeInTheDocument();
  });

  test("reporta el error al backend vía POST /api/logs/client", async () => {
    let received = null;
    server.use(
      http.post(`${API_URL}/logs/client`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    render(
      <ErrorBoundary section="checkout" fallback={<p>Fallback de prueba</p>}>
        <Bomb />
      </ErrorBoundary>
    );

    await waitFor(() => expect(received).not.toBeNull());
    expect(received.event).toBe("client.error_boundary");
    expect(received.section).toBe("checkout");
    expect(received.message).toBe("boom");
    expect(received).toHaveProperty("timestamp");
  });
});
