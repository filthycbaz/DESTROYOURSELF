# Estrategia de pruebas — DestroyYourself

## 1. Objetivo

Cubrir los flujos reales de este ecommerce (auth, productos, carrito, checkout, órdenes) con la
menor duplicación posible entre niveles: cada nivel prueba lo que le corresponde, y Cypress no
repite lo que ya está cubierto de forma más rápida y aislada a nivel unitario o de integración.

## 2. Mapa funcional real

Módulos que existen en el código (confirmado leyendo `server/routes/`, `server/controllers/`,
`client/src/pages/` y `client/src/context/` — no se listan módulos que no existen, como pagos
reales, descuentos o panel de administración, porque no están implementados).

| Módulo | Backend | Frontend | E2E | Riesgo |
|---|---|---|---|---|
| Registro | `POST /api/auth/register` (`authController.js`) | `LoginPage.jsx` (modo `register`) | `register.cy.js` | Medio — duplicidad de email, hash de password |
| Login | `POST /api/auth/login` | `LoginPage.jsx` (modo `login`) | `login.cy.js` | Alto — es el gate de todo lo demás |
| Autenticación | `authMiddleware.js` (`protect`) | `AuthContext.jsx`, `getAuthHeader()` | `login.cy.js` (persistencia, rutas protegidas) | Alto — JWT en localStorage (ver `known-issues.md`) |
| Autorización | `authMiddleware.js` (`requireAdmin`) | N/A (no hay UI de admin) | No cubierto (no hay usuario admin en los flujos E2E actuales) | Medio — solo se prueba a nivel backend |
| Productos | `productController.js` (CRUD) | `HomePage.jsx`, `ProductDetailPage.jsx`, `ProductCard.jsx` | Implícito (checkout parte de un producto real) | Medio |
| Categorías | `categoryController.js` | `HomePage.jsx` (filtros) | Implícito | Bajo |
| Inventario (stock) | `Product.stock`, verificado en `orderController.createOrder` | No hay UI de stock visible al usuario | `checkout.cy.js` (error de stock insuficiente, mockeado) | Alto — es dinero/inventario real |
| Carrito | `cartController.js` (`/api/cart`) | `AppContext.jsx`, `CartPage.jsx`, `CartItem.jsx` | `checkout.cy.js` (Bloque 1) | Alto |
| Direcciones | N/A — no hay entidad "dirección" reutilizable, solo `shippingAddress` embebido en la orden | `CheckoutPage.jsx` (campos del formulario) | `checkout.cy.js` (Bloque 2) | Bajo |
| Checkout | `orderController.createOrder` | `CheckoutPage.jsx` (formulario único, no wizard) | `checkout.cy.js` (Bloques 2-3) | Alto |
| Pagos | Solo se guarda `paymentMethod` como intención (`efectivo`\|`tarjeta`\|`transferencia`) — no hay cobro real | `CheckoutPage.jsx` (selección de método) | `checkout.cy.js` (Bloque 3) | Medio — no hay pasarela real que romper, pero si se agrega una, este nivel de riesgo sube a Alto |
| Órdenes | `orderController.js` (crear, listar, detalle) | `ConfirmationPage.jsx`, `OrdersPage.jsx`, `OrderDetailPage.jsx` | `checkout.cy.js` (Bloque 4) | Alto |
| Descuentos | No implementado | No implementado | No aplica | — |
| Administración | Solo autorización a nivel API (`requireAdmin`); no hay UI de admin en `client/` | No implementado | No aplica | Bajo (superficie pequeña, ya cubierta por `middleware.auth.test.js`) |

## 3. Pirámide de pruebas

Distribución real actual (164 pruebas automatizadas, todas verificadas pasando en esta auditoría):

| Nivel | Cantidad | % real | % de referencia |
|---|---|---|---|
| Backend unitario | 37 | 22.6 % | — |
| Backend integración (incluye contratos) | 60 | 36.6 % | — |
| **Total backend** | **97** | **59.1 %** | ~60 % unitario+integración combinado |
| Frontend unitario/integración | 40 | 24.4 % | ~25 % |
| E2E (Cypress) | 27 | 16.5 % | ~15 % |

La distribución real queda muy cerca de la referencia 60/25/15 combinando ambos niveles de
backend contra el 60 % sugerido — es coincidencia razonable, no un ajuste forzado a posteriori
(las cifras exactas de cada archivo están en `test-matrix.md`).

### Qué cubre cada nivel en este proyecto

**Unitario (backend, `server/tests/unit/`)** — sin Mongo real, sin red: middlewares (`protect`,
`requireAdmin`, `validate`) con mocks acotados a un solo colaborador, y validaciones de schema de
Mongoose (`User`, `Product`, `Order`) vía `mongodb-memory-server` en memoria (no es una DB "real"
externa, pero tampoco se mockea Mongoose — se ejecuta contra una instancia real en memoria, que es
la definición de "aislado" que usa este proyecto).

**Integración de API (backend, `server/tests/integration/`)** — supertest contra la app Express
real, con `mongodb-memory-server`, cubriendo cada endpoint: código HTTP, forma de la respuesta,
efectos en base de datos (decremento de stock, creación de orden), y autorización (401/403/404).
Incluye `contracts.routes.test.js`, que verifica específicamente que la forma del payload sigue
siendo la que el cliente React espera (ver `test-data.md` para el detalle de qué campos se
verifican y por qué).

**Unitario/integración de frontend (`client/src/**/*.test.jsx`)** — Jest (vía `react-scripts`) +
React Testing Library + MSW. No es "solo unitario" en el sentido estricto: cada test renderiza la
página real con `AuthProvider`/`AppProvider` reales (no mockeados) y solo intercepta la capa de
red (MSW), así que ya ejercita la integración componente↔contexto↔servicio sin necesitar el
backend corriendo. Es deliberadamente el mismo archivo/nivel para "unitario" e "integración de
frontend" — separarlos en carpetas distintas hubiera sido duplicar setup sin ganar señal nueva.

**E2E (Cypress, `client/cypress/e2e/`)** — navegador real contra cliente y API reales (backend +
Mongo efímero, `server/scripts/e2e-server.mjs`). Reservado para: registro, login (incluida
persistencia de sesión y protección de rutas), y el flujo completo de checkout en cuatro bloques
funcionales. No se duplican en Cypress los casos que ya cubre RTL+MSW (por ejemplo, los mensajes
de validación de formulario ya probados en `LoginPage.test.jsx` no se vuelven a probar uno por uno
en Cypress — Cypress sí prueba el bloqueo de envío por HTML5 nativo, que JSDOM no puede simular).

## 4. Herramientas

| Capa | Herramienta | Justificación |
|---|---|---|
| Backend unit/integración | Vitest + supertest + mongodb-memory-server | Ya eran las herramientas elegidas antes de esta auditoría; se mantienen sin cambios |
| Frontend unit/integración | Jest (vía `react-scripts`, no Vitest — el proyecto es CRA, no Vite) + React Testing Library + MSW | CRA trae Jest embebido; usar Vitest hubiera significado correr dos runners de test distintos sin necesidad |
| E2E | Cypress | Ya elegido; se reutiliza |
| Contratos | Aserciones `toMatchObject` en tests de integración existentes (`contracts.routes.test.js`) | No se introduce Zod/JSON Schema/OpenAPI — el proyecto no tenía ninguna elegida y una dependencia nueva no estaba justificada solo para esto (ver `known-issues.md`) |
| CI | GitHub Actions | Ya configurado (`.github/workflows/ci.yml`) |

## 5. Alcance

Cubierto por esta auditoría: auth (registro/login/sesión), productos (listado/detalle),
categorías (filtro), carrito (agregar/quitar/cantidad/subtotal), checkout (formulario único +
creación de orden), y órdenes (listado + detalle — cerrado en esta auditoría, antes sin tests de
frontend).

Fuera de alcance (no implementado en el código, por lo tanto no hay nada que probar): pasarela de
pago real, descuentos, panel de administración, recuperación de contraseña.

## 6. Criterios de aceptación de esta estrategia

- Las pruebas existentes de la API fueron auditadas (ver `test-matrix.md` y el hallazgo de
  3 aserciones débiles corregidas, sin reescribir tests que ya validaban comportamiento real).
- Ninguna prueba funcional existente fue eliminada.
- Unitario e integración de backend están en carpetas separadas (`tests/unit/` / `tests/integration/`).
- El frontend tiene pruebas unitarias/integración (40 tests, 9 archivos).
- Los flujos críticos (registro, login, checkout) tienen E2E.
- Existe una estrategia común de datos de prueba (`test-data.md`).
- Existe matriz de trazabilidad (`test-matrix.md`).
- Scripts consistentes documentados (`running-tests.md`).
- Pipeline de CI existente y ejecutando las 3 capas + build (`.github/workflows/ci.yml`).
- Todas las suites fueron ejecutadas en esta auditoría — resultados reales en el reporte final,
  no estimados.
