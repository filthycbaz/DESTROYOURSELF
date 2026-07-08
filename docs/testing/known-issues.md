# Known issues — DestroyYourself testing

Bugs reales del producto, deuda técnica de testing, y limitaciones de servicios externos —
separado en tres secciones para no mezclar "el código tiene un bug" con "la suite tiene un gap".

## 1. Defectos reales del producto (documentados, no corregidos — fuera de alcance)

| ID | Descripción | Evidencia | Severidad |
|---|---|---|---|
| DEF-01 | El botón "Agregar al carrito" de `ProductCard` (listado) no agrega nada — solo navega al detalle del producto. | `client/src/components/ProductCard.jsx`, `handleAddToCart` llama `navigate()`, nunca `addToCart()`. Caracterizado en `cypress/support/commands.js` (comentario en `cy.addProductToCart()`, que por eso usa `ProductDetailPage` en vez de este botón). | Media |
| DEF-02 | Al intentar pagar sin sesión desde `/cart`, el mensaje "Debes iniciar sesión" nunca llega a pintarse — `navigate()` desmonta el componente en el mismo tick que `setMessage()`. | `client/src/pages/CartPage.jsx`, `handleCheckout`. Test que caracteriza el comportamiento real: `client/src/pages/CartPage.test.jsx`. | Baja |
| DEF-03 | Un usuario con sesión válida que hace un **hard reload** (o entra directo por URL) a una ruta protegida es redirigido a `/login` — `AuthContext` inicializa `auth: false` y solo lo corrige en un `useEffect` que corre después de que `PrivateRoute` ya evaluó y redirigió. Navegar por click dentro de la app sí funciona bien. | `client/src/components/PrivateRoute.jsx` + `client/src/context/AuthContext.jsx`. Confirmado en RTL (`PrivateRoute.test.jsx`) **y** en Cypress real (`login.cy.js`, test `[DEFECTO DEF-03]`). | **Alta** |

Ninguno de estos se corrigió: la instrucción explícita de esta tarea es no cambiar lógica
funcional del ecommerce para hacer pasar una prueba. Cada uno tiene un test que **caracteriza**
el comportamiento actual (no que "falla" en el sentido de estar roto) — si algún día se corrige el
código, esos tests deben actualizarse para reflejar el comportamiento correcto.

## 2. Gaps de testing identificados en esta auditoría (documentados, algunos ya cerrados)

| Gap | Estado | Nota |
|---|---|---|
| `OrdersPage`/`OrderDetailPage` sin tests de frontend | **Cerrado en esta auditoría** | `client/src/pages/OrdersPage.test.jsx` (4 tests) y `OrderDetailPage.test.jsx` (2 tests) — cobertura de `src/pages` subió de 73 % a 94 % de statements |
| Sin pruebas de contrato entre frontend y backend | **Cerrado en esta auditoría** | `server/tests/integration/contracts.routes.test.js`, sin agregar Zod/JSON Schema/OpenAPI (ver justificación en `strategy.md` §4) |
| 3 aserciones débiles en tests de backend (`length > 0` en vez de contenido específico) | **Cerrado en esta auditoría** | `category.routes.test.js`, `order.routes.test.js`, `model.order.test.js` — corregidas sin reescribir la lógica de los tests |
| `AppContext.jsx` (rama autenticada del carrito, `syncCartOnLogin`) con cobertura de branches baja (40 %) | **Abierto** | El flujo autenticado de carrito se prueba indirectamente vía `CheckoutPage.test.jsx` (mockeando `GET /cart` ya resuelto) y vía `checkout.cy.js` en E2E real, pero no hay un test de frontend dedicado al *proceso* de sincronización local→servidor al hacer login. Riesgo medio: el camino ya está cubierto end-to-end, falta el nivel intermedio |
| `productController`/`categoryController`/`cartController` no usan `express-validator` (solo validación de schema de Mongoose) | **Abierto, es una decisión del código, no un gap de tests** | Confirmado leyendo `server/routes/productRoutes.js` y `categoryRoutes.js` — no tienen middleware `body()`/`validate`, a diferencia de `authRoutes.js` y `orderRoutes.js`. No se "arregla" agregando validadores nuevos (sería cambiar lógica funcional fuera de alcance), solo se documenta la inconsistencia |
| "Cantidad mínima 1" en el carrito es una regla solo de cliente | **Abierto, decisión del código** | `PUT /api/cart/:itemId` no rechaza `quantity: 0` o negativo a nivel de API — la UI simplemente no lo permite (`updateQuantity` en `AppContext.jsx` tiene `if (qty < 1) return`). Si algún cliente llama a la API directamente sin pasar por la UI, puede dejar cantidades inválidas |
| Sin reporter JUnit en frontend | **Abierto, decisión explícita** | Vitest (backend) trae reporter `junit` nativo, usado sin dependencia nueva. Jest vía `react-scripts` no lo trae — agregarlo requeriría `jest-junit`, una dependencia nueva no justificada solo para reporting (regla explícita: no introducir dependencias sin justificar) |
| No hay usuario admin en ningún flujo E2E | **Abierto** | Los 3 specs de Cypress usan solo `seb@destroy.com` (role `user`). Las rutas de admin (crear/editar producto, ver todas las órdenes) están cubiertas a nivel de integración de API (`I-PRD-06`, `I-ORD-11`) pero no hay UI de admin en `client/` para probarlas en E2E — no existe qué probar ahí |

## 3. Servicios externos y limitaciones de infraestructura

- **No hay pasarela de pago real** — `paymentMethod` se guarda como intención, sin cobro real.
  Nada que mockear porque no hay integración real que sustituir.
- **GitHub Actions bloqueado por facturación** en el repo remoto al momento de esta auditoría
  (`"The job was not started because your account is locked due to a billing issue"`) — no es un
  problema del pipeline ni de los tests; todos los resultados de este documento vienen de
  corridas **locales** verificadas manualmente. Hay que resolver la facturación de la cuenta de
  GitHub para que `.github/workflows/ci.yml` corra de verdad en los próximos PRs.
- **Stock finito en el entorno E2E**: si se corre `checkout.cy.js` varias veces seguidas contra la
  **misma** instancia de `server/scripts/e2e-server.mjs` sin reiniciarla, el producto usado
  (`SUETER NEWSHOP TINTO`, `stock: 5`) puede agotarse y `POST /orders` empieza a devolver 400
  legítimamente (no es un test flaky, es inventario real acabándose). La suite ya usa
  `quantity: 1` por orden para minimizar esto, pero un pipeline de CI que reinicia el entorno
  efímero en cada corrida (que es lo que hace `e2e:server`, siempre desde cero) no lo sufre.
- **Plugin Codex** (segunda opinión post-PR, ver `.claude/model-policy.md`) requiere que cada
  persona del equipo complete `/plugin install codex@openai-codex` una vez — no es 100 %
  automático solo por estar declarado en `.claude/settings.json`.

## 4. Infraestructura de testing — decisiones no obvias (por qué existen ciertos workarounds)

Documentado en detalle en `docs/testing.md` §9 (se mantiene ahí en vez de duplicarlo acá):
resolución rota de `react-router-dom@7` bajo Jest 27, polyfills de `TextEncoder`/`TransformStream`
en `setupTests.js`, y el pin de `msw@2.4.0` (en vez de `latest`) por incompatibilidad de
dependencias ESM-only con el transform de Jest de Create React App.
