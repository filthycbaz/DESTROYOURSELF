// Genera datos únicos por ejecución para evitar colisiones entre corridas
// (el backend no expone un endpoint para borrar usuarios de prueba — ver
// docs/testing.md "Limitaciones de limpieza de datos").
export function uniqueTestUser(prefix = "cypress") {
  const timestamp = Date.now();
  const email = `${prefix}-${timestamp}@example.com`;
  return {
    name: `Usuario ${prefix} ${timestamp}`,
    email,
    password: "Test1234!",
  };
}

export function uniqueAddress() {
  return {
    street: "Av. Siempre Viva 742",
    city: "Ciudad de México",
    state: "CDMX",
    zip: "01000",
  };
}
