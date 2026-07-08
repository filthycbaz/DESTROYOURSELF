# Estrategia de datos de prueba — DestroyYourself

Una sola convención por nivel — ninguna suite inventa su propio formato de datos.

## Backend (Vitest + mongodb-memory-server)

`server/tests/helpers.js` es la única fuente de factories. Todo test de integración/unitario que
necesite un usuario, producto o dirección pasa por acá — no hay `User.create({...})` repetido con
literales distintos en cada archivo.

```js
createUser(overrides)    // usuario normal, email único por timestamp
createAdmin(overrides)   // usuario con role: "admin"
createProduct(overrides) // producto con stock: 5, isAvailable: true por defecto
tokenFor(user)           // JWT válido por 1h, firmado con el mismo JWT_SECRET del entorno de test
authHeader(user)         // { Authorization: "Bearer ..." } listo para .set() en supertest
validAddress()           // shippingAddress válida completa
```

`server/tests/setup.js` levanta un `mongodb-memory-server` una vez por corrida (`beforeAll`) y
limpia todas las colecciones entre tests (`afterEach`) — cada test arranca con DB vacía, sin
depender del orden de ejecución.

## Frontend (Jest + RTL + MSW)

`client/src/test-utils/msw/handlers.js` centraliza los fixtures y handlers por defecto:

```js
mockProduct, mockProduct2   // productos fijos (id, precio y talla conocidos)
mockUser                    // usuario fijo para login exitoso
mockOrder                   // orden fija para OrdersPage/OrderDetailPage
mockCategories               // categorías fijas
handlers                    // array de handlers MSW registrados por defecto en setupTests.js
```

Cada test que necesita un caso distinto del happy path (error, vacío, delay) usa
`server.use(http.get(...))` para sobreescribir el handler **solo para ese test** — `afterEach` en
`setupTests.js` resetea los handlers automáticamente (`server.resetHandlers()`), así que no hay
fuga de estado entre tests.

`client/src/test-utils/render.jsx` (`renderWithProviders`) monta cada página con el mismo árbol de
providers que `App.jsx` usa en producción (`AuthProvider` → `AppProvider` → `Router`), para no
tener que simular contexto a mano en cada archivo.

## Cypress (E2E)

- **Usuario válido conocido:** `seb@destroy.com` / `password123` — sembrado por
  `server/seed.js`, usado por `cy.loginByApi()` para login/checkout.
- **Usuario duplicado (para probar el error de registro):** el mismo `seb@destroy.com`, se
  reutiliza a propósito en `register.cy.js` para el caso "correo ya existente" — no hace falta un
  segundo usuario fijo distinto.
- **Usuario nuevo por corrida:** `uniqueTestUser()` (`cypress/utils/testData.js`) genera
  `cypress-${Date.now()}@example.com` — nunca una cuenta fija para registro exitoso, así corridas
  repetidas no colisionan.
- **Producto con inventario conocido:** `SUETER NEWSHOP TINTO` (sembrado con `stock: 5`),
  referenciado por nombre en `cypress/fixtures/products.json` — nunca por `_id` (los ids son
  generados por Mongo en cada seed, no son estables entre entornos).
- **Producto sin inventario / eliminado:** no existe un producto sembrado con `stock: 0` ni
  `isAvailable: false` — el caso "stock insuficiente" en `checkout.cy.js` se prueba con
  `cy.intercept` devolviendo un 400 simulado, no con datos reales agotados (ver justificación en
  `docs/testing.md` §9 y `known-issues.md`).
- **Carrito con productos:** se construye en cada test vía `cy.addProductToCart()`, nunca se
  asume un carrito preexistente.
- **Orden válida / orden fallida:** "válida" es el resultado real de `checkout.cy.js` Bloque 4;
  "fallida" se simula con `cy.intercept` (400 de stock insuficiente) — no se agota inventario real
  para forzarla, por la misma razón del punto anterior.

### Limpieza de datos en Cypress

- `cy.clearCartByApi()` vacía el carrito del usuario sembrado (`DELETE /api/cart`, real) al
  inicio de cada test de checkout — necesario porque el carrito vive en Mongo, no en
  `localStorage`, y `cy.session()` no lo resetea.
- Los usuarios creados por `register.cy.js` **no se limpian** — no existe un endpoint
  `DELETE /api/users/:id`. Con emails únicos por timestamp esto no genera colisiones, solo
  acumulación (documentado como limitación real, no oculta).
- El stock consumido por órdenes reales creadas en `checkout.cy.js` tampoco se restaura — la
  estrategia correcta es levantar un Mongo efímero nuevo por corrida completa de la suite
  (`server/scripts/e2e-server.mjs`, que siempre siembra desde cero), no reutilizar una instancia
  entre corridas repetidas.

## Tabla resumen

| Entidad | Método de creación | Método de limpieza | Suites que la usan |
|---|---|---|---|
| Usuario válido | `createUser()` (backend) / `mockUser` (frontend) / `seb@destroy.com` sembrado (E2E) | `afterEach` limpia colecciones (backend) / `resetHandlers()` (frontend) / no aplica, es fijo (E2E) | Todas |
| Usuario admin | `createAdmin()` (backend) / `admin@destroy.com` sembrado (E2E, no usado activamente en specs actuales) | Igual que arriba | `middleware.auth.test.js`, `product.routes.test.js`, `category.routes.test.js`, `order.routes.test.js` |
| Usuario nuevo (registro) | `uniqueTestUser()` (E2E) / email con `Date.now()` en tests de frontend | No se limpia (emails únicos evitan colisión) | `register.cy.js`, `LoginPage.test.jsx` |
| Producto disponible | `createProduct()` (backend) / `mockProduct`, `mockProduct2` (frontend) / `SUETER NEWSHOP TINTO` sembrado (E2E) | `afterEach` (backend) / `resetHandlers()` (frontend) / re-seed por corrida (E2E) | Todas las de productos/carrito/checkout |
| Producto sin inventario | No existe fixture dedicado — se simula stock insuficiente vía payload de cantidad alta contra `product.routes.test.js`/`order.routes.test.js`, o `cy.intercept` en E2E | No aplica | `order.routes.test.js` (`I-ORD-04`), `checkout.cy.js` |
| Carrito con productos | `POST /api/cart` real (backend) / `seedLocalCart()` helper (frontend, localStorage) / `cy.addProductToCart()` (E2E) | Vacío por defecto en cada test | `cart.routes.test.js`, `CartPage.test.jsx`, `checkout.cy.js` |
| Orden válida | Resultado real de `POST /api/orders` en los 3 niveles | `afterEach` (backend) / no aplica (frontend, mockeado) / no se limpia, re-seed por corrida (E2E) | `order.routes.test.js`, `CheckoutPage.test.jsx`, `checkout.cy.js` |
| Orden fallida | `cy.intercept`/`server.use()` con status 400 simulado | No aplica | `CheckoutPage.test.jsx`, `checkout.cy.js` |
