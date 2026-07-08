# Testing — DestroyYourself

Estrategia de pruebas del proyecto: unitarias/integración de backend (Vitest), unitarias de
componentes de frontend (Jest + React Testing Library, vía `react-scripts test`) y end-to-end
(Cypress). Este documento describe cómo está montada la suite, cómo ejecutarla, y las
limitaciones/defectos reales descubiertos al construirla.

---

## 1. Estrategia general

| Nivel | Qué prueba | Herramienta | Dónde |
|---|---|---|---|
| Unitaria (backend) | Modelos Mongoose, middlewares, en aislamiento | Vitest | `server/tests/unit/` |
| Integración (backend) | Rutas Express completas contra una DB real en memoria | Vitest + supertest + mongodb-memory-server | `server/tests/integration/` |
| Unitaria/componente (frontend) | Comportamiento observable de páginas/componentes React, con la API interceptada | Jest (`react-scripts test`) + React Testing Library + MSW | `client/src/**/*.test.jsx` |
| End-to-end (E2E) | Flujos completos en un navegador real contra la app + API reales | Cypress | `client/cypress/e2e/` |

**Diferencia entre los niveles:** unitario prueba una función/modelo aislado; integración de
backend prueba una ruta HTTP completa contra Mongo real (sin mockear Mongoose); componente de
frontend renderiza una página React real con la API mockeada (MSW), sin navegador; E2E maneja un
navegador real contra el cliente y el servidor real corriendo, sin mockear nada de la app.

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

```bash
# Backend — unitarias + integración (Vitest, mongodb-memory-server, no requiere Atlas)
cd server
npm test                 # todo
npm run test:unit
npm run test:int
npm run test:coverage

# Frontend — componentes (Jest de CRA, MSW mockea la API, no requiere backend corriendo)
cd client
npm run test:run         # una sola corrida, sin watch
npm run test:coverage

# Cypress — requiere client (puerto 3000) y server (puerto 3001) corriendo
cd client
npm run cypress:open     # modo interactivo
npm run cypress:run      # headless
npm run test:e2e:headed  # headless con navegador visible
```

### Levantar el entorno para Cypress

**Opción A — contra Atlas real** (requiere `server/.env` configurado):
```bash
# terminal 1
cd server && npm run dev
# terminal 2
cd client && npm start
# terminal 3
cd client && npm run cypress:run
```

**Opción B — sin Atlas, con Mongo efímero** (la que se usó para verificar esta suite):
```bash
# terminal 1 — API + Mongo en memoria + seed automático
cd server && npm run e2e:server
# terminal 2
cd client && npm start
# terminal 3
cd client && npm run cypress:run
```

`server/scripts/e2e-server.mjs` levanta un `mongodb-memory-server`, corre `seed.js` contra él, y
arranca `server.js` apuntando ahí — nunca toca Atlas. Al terminar (Ctrl+C) destruye la instancia.
Es la opción recomendada para CI (ver §13).

---

## 6. Datos de prueba

- **Registro**: cada test genera un correo único con `uniqueTestUser()` (`cypress/utils/testData.js`),
  usando `Date.now()` — nunca una cuenta fija, así corridas repetidas no colisionan.
- **Login / checkout**: usan el usuario ya sembrado por `server/seed.js`
  (`seb@destroy.com` / `password123`), vía `cy.loginByApi()`.
- **Productos**: `cypress/fixtures/products.json` referencia un producto sembrado por nombre
  (`SUETER NEWSHOP TINTO`), no por `_id` — los ids son generados por Mongo en cada seed y no son
  estables entre entornos. `cy.addProductToCart()` resuelve el `_id` real vía la API antes de
  navegar.

### Limitaciones de limpieza de datos

El backend **no expone** endpoints para borrar usuarios ni órdenes (solo
`POST /register`, `POST /login`, `GET /me` en auth; nada de `DELETE` de usuario). Por eso:

- Los usuarios creados por `register.cy.js` **no se limpian** — quedan en la base. Con correos
  únicos por timestamp esto no genera colisiones, pero sí acumula filas con el tiempo.
- Los tests de checkout reutilizan el mismo usuario sembrado (`seb@destroy.com`) y **vacían su
  carrito con `cy.clearCartByApi()`** en cada `beforeEach` (`DELETE /api/cart`, ese sí existe) para
  que los tests sean independientes entre sí.
- El **stock es finito y real**: `SUETER NEWSHOP TINTO` se siembra con `stock: 5`. La suite de
  checkout usa `quantity: 1` por orden creada precisamente para no agotarlo al correr todos los
  tests de una corrida (3 órdenes reales × 1 unidad). Si se corre el spec de checkout muchas veces
  seguidas contra la **misma** instancia de Mongo sin re-sembrar, el stock se agota y
  `POST /orders` empieza a devolver 400 legítimamente. La forma correcta de evitar esto es
  levantar un Mongo efímero nuevo por corrida (que es lo que hace `npm run e2e:server`, y lo que
  hará cualquier pipeline de CI que arranque el harness desde cero).
- No hay tarea de Cypress para "reset" del backend porque el backend no ofrece esa superficie.
  La opción más segura disponible es la que se usa: Mongo efímero + `seed.js` en cada arranque.

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

## 11. Recomendaciones para CI/CD

No existía pipeline de CI antes de esta tarea. Se agregó `.github/workflows/ci.yml` con:

1. Instalación de dependencias (`server/` y `client/`, con cache de npm).
2. Lint del cliente (`react-scripts` corre eslint como parte del build; no hay un script de lint
   dedicado en ninguno de los dos `package.json`).
3. Unitarias de backend (`npm test` en `server/`, con cobertura).
4. Unitarias de frontend (`npm run test:run` en `client/`, con cobertura).
5. Build de producción del cliente (`npm run build`).
6. Arranque del backend contra Mongo efímero (`npm run e2e:server`, en background) + arranque del
   cliente + Cypress headless (`npm run test:e2e:ci`... en la práctica, dado que ambos servidores
   están en proyectos npm separados, el workflow arranca el backend efímero como un paso propio en
   background y usa `start-server-and-test` solo para esperar al cliente).
7. Subida de videos/screenshots de Cypress como artifact **solo si falla** algún test.

El pipeline falla si falla cualquier paso — no se usa `|| true` en ningún lado.

---

## 12. Cobertura obtenida (última corrida real, ver §14 del reporte de la tarea)

```
Backend    — Statements 90.09% | Branches 68.62% | Functions 100% | Lines 90.09%
Frontend   — Statements 72.93% | Branches 61.70% | Functions 71.42% | Lines 73.86%
```

La cobertura de frontend no incluye `OrdersPage`/`OrderDetailPage` (fuera del alcance pedido:
autenticación, productos, carrito, checkout) ni `src/index.js`/`reportWebVitals.js` (boilerplate
de CRA sin lógica propia).
