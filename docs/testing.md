# Testing — DestroyYourself (referencia detallada)

> **Este archivo es la referencia técnica detallada de la infraestructura de testing.** La
> estrategia integral (pirámide, mapa funcional, alcance), la matriz de trazabilidad, la
> estrategia de datos, cómo correr todo, y los issues conocidos viven ahora en
> [`docs/testing/`](testing/strategy.md) — empezar ahí. Este archivo se mantiene por su detalle de
> infraestructura (§9) y la tabla de `data-testid` (§10), que no están duplicados en otro lado.

---

## 2. Dependencias instaladas

### Backend (`server/`) — ya existían, no se tocaron
`vitest`, `@vitest/coverage-v8`, `mongodb-memory-server`, `supertest`.

### Frontend (`client/`) — instaladas en esta tarea
| Paquete | Motivo |
|---|---|
| `msw` (fijado en `2.4.0`, no `latest`) | Interceptar `fetch` en los tests de componentes. Ver §9 — versiones más nuevas de msw traen dependencias ESM-only que rompen el transform de Jest 27 (react-scripts 5). |
| `graphql` | Peer dependency que `msw` importa en su handler de GraphQL aunque no se use (sin él, Jest no puede resolver `msw`). |
| `@testing-library/user-event` (subido de `^13` a `^14`) | La v13 no tiene `userEvent.setup()`, que es el patrón usado en todos los tests. |
| `@testing-library/cypress` | Da `cy.findByRole`, `cy.findByLabelText`, etc. dentro de Cypress. |
| `cypress` | Runner E2E. |
| `start-server-and-test` | Levanta el dev server del cliente antes de correr Cypress en CI. |

El proyecto usa **Create React App** (`react-scripts 5.0.1`), no Vite — por eso el runner de
unitarias de frontend es el Jest embebido de CRA (`npm test`), no Vitest.

---

## 3. Estructura de carpetas

```
server/
├── tests/
│   ├── setup.js / helpers.js
│   ├── unit/            (5 archivos)
│   └── integration/      (5 archivos)
└── scripts/
    └── e2e-server.mjs    ← API + Mongo efímero para Cypress (ver §7)

client/
├── src/
│   ├── setupTests.js           ← polyfills + arranque del server MSW
│   ├── test-utils/
│   │   ├── render.jsx          ← renderWithProviders(...)
│   │   └── msw/
│   │       ├── handlers.js     ← handlers y fixtures por defecto
│   │       └── server.js
│   └── **/*.test.jsx           ← tests de componentes, junto al componente
├── cypress/
│   ├── e2e/
│   │   ├── auth/register.cy.js
│   │   ├── auth/login.cy.js
│   │   └── checkout/checkout.cy.js
│   ├── fixtures/ (users.json, products.json)
│   ├── support/ (commands.js, e2e.js)
│   └── utils/testData.js
└── cypress.config.js
```

---

## 4. Variables de entorno

### Backend real (Atlas) — no configurado en este entorno de trabajo
`server/.env` con `PORT`, `MONGO_URI`, `JWT_SECRET` (ver raíz `CLAUDE.md`). **No existe en este
checkout**, por eso el E2E se corrió contra el harness efímero del §7 en vez de Atlas.

### Cypress
No se hardcodean credenciales en los specs. Se leen de `Cypress.env()`, configurado en
`cypress.config.js` con defaults que apuntan a los usuarios ya sembrados por `server/seed.js`
(`seb@destroy.com` / `password123`) y pueden sobreescribirse sin tocar código:

```bash
CYPRESS_TEST_USER_EMAIL=otro@correo.com CYPRESS_TEST_USER_PASSWORD=otraClave npx cypress run
```

o con un `client/cypress.env.json` (gitignorado).

---

## 5. Cómo ejecutar

Ver [`docs/testing/running-tests.md`](testing/running-tests.md) para todos los comandos
(backend, frontend, y las dos formas de levantar el entorno de Cypress).

---

## 6. Datos de prueba

Ver [`docs/testing/test-data.md`](testing/test-data.md) para la estrategia completa (factories de
backend, fixtures/MSW de frontend, datos fijos vs. generados en Cypress, y las limitaciones reales
de limpieza — el backend no expone endpoints para borrar usuarios ni órdenes).

---

## 7. `cy.loginByApi()` y `cy.addProductToCart()`

Ambos en `cypress/support/commands.js`.

### `cy.loginByApi({ email, password })`
- Llama a `POST /api/auth/login` real vía `cy.request` (nunca pasa por la UI).
- La app guarda la sesión en `localStorage` (`authToken`, `userData`), **no en cookies** — el
  comando visita `/` primero para estar en el origin correcto antes de escribir en
  `window.localStorage`.
- Usa `cy.session()` para cachear la sesión entre tests del mismo archivo (con `validate()`
  comprobando que `authToken` sigue presente).
- Falla con un mensaje explícito si el login no da `200`.
- No expone la contraseña en logs (`log: false` en el `cy.request`).

### `cy.addProductToCart({ productName, size, quantity })`
- Resuelve el producto real vía `GET /api/products` (por nombre, no por id hardcodeado).
- Navega a `/product/:id` (ruta real de la app; **no** `/products/:id`).
- Selecciona la talla y hace click en "AGREGAR AL CARRITO" — repetido `quantity` veces, porque
  **`ProductDetailPage` no tiene un input de cantidad** en la UI real.
- Verifica el mensaje de éxito y que `cart-count` en el header refleje la cantidad.
- Usa el flujo de `ProductDetailPage` a propósito, no el botón "Agregar al carrito" de las
  tarjetas del listado — ver DEF-01 más abajo.

---

## 8. Qué está mockeado y qué no

- **Frontend unitario (Jest+RTL)**: toda llamada a `fetch` está interceptada por MSW
  (`client/src/test-utils/msw/handlers.js`). No hay mocks manuales de `fetch` ni de módulos.
- **Cypress**: corre contra la app y la API **reales**. Los únicos `cy.intercept` que sustituyen
  la respuesta real son los que simulan **casos de error del servidor** a propósito (p. ej. 401 de
  login, 400 de stock insuficiente) o que agregan un **delay artificial** para probar el estado de
  carga/doble click — nunca para simular el "happy path".
- **No existe pasarela de pago** que mockear: `paymentMethod` (`efectivo` | `tarjeta` |
  `transferencia`) solo se guarda como intención en la orden; no hay cobro real ni proveedor
  externo integrado (PayPal/OXXO no existen en la UI, ver `CLAUDE.md`).

---

## 9. Errores conocidos / decisiones no obvias

Estos son hallazgos reales del entorno o de la app, encontrados mientras se armaba la suite —
no son limitaciones inventadas.

### Infraestructura de testing

1. **`react-router-dom@7.14.2` no resuelve bajo Jest 27** — su campo `"main"` apunta a
   `dist/main.js`, que no existe en el paquete publicado (solo `dist/index.js`/`.mjs`). Se
   resuelve con `moduleNameMapper` en `client/package.json` apuntando directo a `dist/index.js`
   (y lo mismo para el subpath `react-router/dom`). Esto es un problema del paquete tal cual está
   publicado, no de la configuración del proyecto.
2. **`jest-environment-jsdom` 27 no define `TextEncoder`/`TextDecoder`/`TransformStream`
   globalmente** — los necesitan tanto `react-router` v7 como `msw`. Se polyfillean en
   `client/src/setupTests.js` con los propios módulos de Node (`util`, `stream/web`), sin
   dependencias nuevas.
3. **`msw@latest` (2.14.x) no corre bajo Jest 27/CRA5** — trae una dependencia transitiva
   (`rettime`) y varios paquetes `@bundled-es-modules/*` que son ESM puro; Jest los rompe con
   `SyntaxError: Cannot use import statement outside a module` a menos que se agreguen a
   `transformIgnorePatterns` (ya configurado) — y aun así, versiones nuevas del `GraphQLHandler`
   de msw requieren `graphql` como dependencia real (no hay soporte GraphQL en este proyecto, pero
   el import es incondicional). Se resolvió fijando `msw@2.4.0` — una versión anterior sin esas
   dependencias — más `graphql` como devDependency para poder resolver el import.
4. **`@testing-library/user-event@13`** (la versión que ya estaba instalada) no tiene
   `userEvent.setup()` — se subió a `^14`.

### Defectos reales de la aplicación

| ID | Descripción | Dónde |
|---|---|---|
| DEF-01 | El botón "Agregar al carrito" de `ProductCard` (listado de productos) **no agrega el producto al carrito** — solo navega al detalle. El único flujo que agrega de verdad es el botón de `ProductDetailPage`. | `client/src/components/ProductCard.jsx:16-19` |
| DEF-02 | `CartPage.handleCheckout()` llama a `setMessage("Debes iniciar sesión para continuar")` y a `navigate("/login")` en el mismo manejador de click; la navegación desmonta `CartPage` antes de que ese mensaje llegue a pintarse — el usuario nunca lo ve. | `client/src/pages/CartPage.jsx` (función `handleCheckout`) |
| DEF-03 | `AuthContext` inicializa `auth` en `false` y solo lo actualiza dentro de un `useEffect` que corre **después** del primer render. `PrivateRoute` evalúa `auth` en ese primer render. Resultado: un usuario con sesión válida que hace un **hard navigation** (recarga de página, o entra directo por URL) a una ruta protegida (`/checkout`, `/orders`, `/orders/:id`) es redirigido a `/login` aunque su token siga siendo válido. Navegar por click **dentro** de la app sí funciona bien, porque para entonces el efecto ya corrió. Confirmado tanto en RTL (`PrivateRoute.test.jsx`) como en Cypress (`login.cy.js`, test `[DEFECTO DEF-03]`). | `client/src/components/PrivateRoute.jsx` + `client/src/context/AuthContext.jsx` |
| DEF-04 (menor) | Las etiquetas de los formularios de login/registro y checkout no tenían `htmlFor`/`id` — quedaban visualmente asociadas pero no programáticamente. Se corrigió como parte de esta tarea (regla explícita: se permite agregar atributos de accesibilidad). No bloqueaba nada, pero rompía `getByLabelText`/lectores de pantalla. | `LoginPage.jsx`, `CheckoutPage.jsx` (ya corregido) |

Ninguno de estos defectos se corrigió en su lógica (fuera del alcance de esta tarea, salvo
DEF-04 que es puramente de accesibilidad) — están documentados y algunos tienen un test que
caracteriza el comportamiento actual explícitamente marcado como defecto en el título del test.

---

## 10. Tabla de `data-testid`

Solo se listan los que realmente usa algún test. Se prefirió `getByRole`/`getByLabelText`/texto
visible siempre que alcanzaba; `data-testid` se agregó donde el contenido es dinámico/repetido
(por id de producto o de item de carrito) o donde el texto del elemento cambia según el estado
(botones con estado de carga).

| Módulo | Componente | Elemento | `data-testid` | Archivo |
|---|---|---|---|---|
| Auth | LoginPage | Formulario (login/registro) | `login-form` / `register-form` | `client/src/pages/LoginPage.jsx` |
| Auth | LoginPage | Campo nombre (solo registro) | `register-name-input` | idem |
| Auth | LoginPage | Campo email | `login-email-input` / `register-email-input` (mismo input, cambia según modo) | idem |
| Auth | LoginPage | Campo contraseña | `login-password-input` / `register-password-input` | idem |
| Auth | LoginPage | Confirmar contraseña (solo registro) | `register-confirm-password-input` | idem |
| Auth | LoginPage | Error | `auth-error` | idem |
| Auth | LoginPage | Botón enviar | `login-submit-button` / `register-submit-button` | idem |
| Auth | LoginPage | Botón alternar modo | `auth-toggle-mode-button` | idem |
| Productos | ProductCard | Tarjeta | `product-card-{id}` | `client/src/components/ProductCard.jsx` |
| Productos | ProductCard | Botón (ver DEF-01) | `product-card-add-button-{id}` | idem |
| Productos | ProductDetailPage | Contenedor de detalle | `product-detail` | `client/src/pages/ProductDetailPage.jsx` |
| Productos | ProductDetailPage | Opción de talla | `size-option-{talla}` | idem |
| Productos | ProductDetailPage | Agregar al carrito | `add-to-cart-button` | idem |
| Productos | ProductDetailPage | Mensaje | `add-to-cart-message` | idem |
| Carrito | Header | Link al carrito | `header-cart-link` | `client/src/components/Header.jsx` |
| Carrito | Header | Contador | `cart-count` | idem |
| Carrito | CartItem | Item | `cart-item-{id}-{talla}` | `client/src/components/CartItem.jsx` |
| Carrito | CartItem | Cantidad | `cart-item-quantity-{id}-{talla}` | idem |
| Carrito | CartItem | Incrementar / decrementar / eliminar | `cart-item-increment-...` / `cart-item-decrement-...` / `cart-item-remove-...` | idem |
| Carrito | CartPage | Subtotal / total | `cart-subtotal` / `cart-total` | `client/src/pages/CartPage.jsx` |
| Carrito | CartPage | Continuar al pago | `cart-checkout-button` | idem |
| Carrito | CartPage | Mensaje | `cart-message` | idem |
| Checkout | CheckoutPage | Formulario (único, no hay wizard) | `checkout-customer-form` | `client/src/pages/CheckoutPage.jsx` |
| Checkout | CheckoutPage | Fieldset dirección | `checkout-shipping-form` | idem |
| Checkout | CheckoutPage | Fieldset pago | `checkout-payment-form` | idem |
| Checkout | CheckoutPage | Campos | `checkout-name-input`, `checkout-email-input`, `checkout-street-input`, `checkout-city-input`, `checkout-state-input`, `checkout-zip-input` | idem |
| Checkout | CheckoutPage | Método de pago | `checkout-payment-tarjeta` / `checkout-payment-transferencia` / `checkout-payment-efectivo` | idem |
| Checkout | CheckoutPage | Total | `checkout-total` | idem |
| Checkout | CheckoutPage | Error | `checkout-error` | idem |
| Checkout | CheckoutPage | Confirmar | `checkout-confirm-button` | idem |
| Confirmación | ConfirmationPage | Contenedor | `order-success` | `client/src/pages/ConfirmationPage.jsx` |
| Confirmación | ConfirmationPage | Número de orden | `order-number` | idem |

No existe un flujo de "recuperar contraseña", ni un input de cantidad en el detalle de producto,
ni pasos separados de envío/pago en el checkout — no se agregaron `data-testid` para elementos
que no existen en la app real.

---

## 11. CI/CD

`.github/workflows/ci.yml` — ver [`docs/testing/known-issues.md`](testing/known-issues.md) §3
para el estado real del pipeline (bloqueado por facturación de GitHub Actions al momento de la
última auditoría) y [`docs/testing/strategy.md`](testing/strategy.md) §4 para el detalle de qué
corre cada job.

---

## 12. Cobertura obtenida

Cifras actualizadas y matriz completa en [`docs/testing/test-matrix.md`](testing/test-matrix.md).
`OrdersPage`/`OrderDetailPage` ya tienen cobertura de frontend (cerrado en la auditoría más
reciente, ver `known-issues.md` §2).
