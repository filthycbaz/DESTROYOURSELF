import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../test-utils/msw/server";
import { API_URL } from "../config/api";
import { logEvent } from "./logService";

describe("logService", () => {
  test("manda el evento a POST /api/logs/client con timestamp", async () => {
    let received = null;
    server.use(
      http.post(`${API_URL}/logs/client`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const payload = logEvent("test.event", { section: "test" });

    expect(payload.event).toBe("test.event");
    expect(payload.section).toBe("test");
    expect(payload).toHaveProperty("timestamp");

    await waitFor(() => expect(received).not.toBeNull());
    expect(received).toEqual(payload);
  });

  test("si el POST falla (red caída), no lanza ni deja una promesa sin manejar", async () => {
    let handlerCalled = false;
    server.use(
      http.post(`${API_URL}/logs/client`, () => {
        handlerCalled = true;
        return HttpResponse.error();
      })
    );

    // El valor de retorno no depende del resultado del fetch — logEvent no
    // espera la red, así que esto nunca puede lanzar por más que el POST
    // falle después.
    expect(() => logEvent("test.event")).not.toThrow();

    // Si el .catch() interno de logService se borrara alguna vez, el fetch
    // rechazado quedaría sin manejar acá y Jest lo reporta como falla del
    // test (o del proceso) — esta espera es lo que lo pondría en evidencia.
    await waitFor(() => expect(handlerCalled).toBe(true));
  });
});
