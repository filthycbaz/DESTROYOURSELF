# DestroyYourself

Bazar de ropa urbana de segunda mano. Aplicación fullstack con cliente en React y servidor en
Express + MongoDB.

---

## 1. Descripción

DestroyYourself es una tienda online de ropa urbana usada: catálogo con filtro por categoría,
carrito persistente (localStorage para invitados, MongoDB para usuarios autenticados), checkout
con validación de stock y cálculo de total en servidor, historial de órdenes por usuario, y un
panel de auth con JWT. Pagos disponibles: `efectivo`, `tarjeta`, `transferencia` (sin pasarela
real integrada — el usuario coordina el pago fuera de la app).

```
destroyourself/
├── client/   → React (Create React App)
└── server/   → Express + MongoDB
```

---

## 2. Instalación

Requisitos previos: Node.js v18+, npm, y una base MongoDB (Atlas o local).

```bash
git clone <repo>
cd destroyourself
cd server && npm install
cd ../client && npm install
```

Backend — crear `server/.env` (plantilla completa en [`server/.env.example`](server/.env.example)):

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/destroyourself
JWT_SECRET=tu_secreto
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Frontend — ya existe `client/.env.development` con `REACT_APP_API_URL=http://localhost:3001/api`
(plantilla en [`client/.env.example`](client/.env.example)).

Referencia completa de todas las variables (backend y frontend) y validaciones:
[`docs/environment-variables.md`](docs/environment-variables.md).

---

## 3. Cómo correr

```bash
# Backend — http://localhost:3001
cd server
npm run dev        # nodemon app.js, hot-reload
npm run seed        # opcional: poblar la base con datos iniciales

# Frontend — http://localhost:3000
cd client
npm start
```

| Directorio | Comando          | Descripción                       |
|------------|------------------|------------------------------------|
| `server`   | `npm run dev`    | Servidor con hot-reload (nodemon)  |
| `server`   | `npm run seed`   | Poblar la base de datos            |
| `server`   | `npm test`       | Suite de tests (vitest)            |
| `client`   | `npm start`      | Cliente en modo desarrollo         |
| `client`   | `npm run build`  | Build de producción                |
| `client`   | `npm test`       | Suite de tests (Testing Library)   |

Con el backend caído (Mongo pausado o servidor apagado), el frontend no queda en pantalla blanca:
cada fetch crítico tiene try/catch y muestra un mensaje de error al usuario, y un `ErrorBoundary`
por sección (catálogo, carrito, checkout) cubre cualquier otro error de render. `GET /api/health`
sirve para verificar en un vistazo si el proceso del backend está arriba.

---

## 4. Arquitectura

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, React Router v7, Context API (`AppContext` = carrito, `AuthContext` = sesión), fetch nativo |
| Backend | Node.js, Express 5, ES Modules |
| Base de datos | MongoDB Atlas (Mongoose 9) |
| Auth | JWT (7 días), Bearer token en `localStorage` |

```
client/src/
├── config/api.js     ← URL base de la API (REACT_APP_API_URL)
├── context/           ← AppContext (carrito) + AuthContext (sesión)
├── services/           ← authService (localStorage + fetch)
└── pages/               ← una página por ruta, con su propio fetch + estado

server/
├── controllers/    ← lógica de negocio, siempre async (req, res, next) + try/catch → next(error)
├── middlewares/     ← authMiddleware (JWT), validate (express-validator), rateLimit
├── models/            ← esquemas Mongoose
└── routes/             ← definición de endpoints + validaciones inline + docs OpenAPI
```

El total de la orden se calcula siempre en el servidor (nunca se confía en el total que manda el
cliente). El carrito vive en `localStorage` mientras el usuario es anónimo y se sincroniza con
MongoDB al iniciar sesión. Mapa completo de qué dato vive dónde y por qué:
[`docs/data-flow.md`](docs/data-flow.md).

---

## 5. Decisiones técnicas

- **Cálculo de totales en servidor** (`orderController.js`): el cliente nunca es la fuente de
  verdad del precio — evita manipulación del total desde el navegador.
- **Whitelist de campos editables** en `updateProduct` (`UPDATABLE_PRODUCT_FIELDS`): nunca se pasa
  `req.body` crudo a Mongoose, cierra mass assignment.
- **JWT en `localStorage`, no cookies httpOnly**: decisión pragmática para el alcance actual del
  proyecto; queda documentada como deuda de seguridad conocida (`SEC-001` en
  [`docs/backlog.md`](docs/backlog.md)), no como omisión accidental.
- **Logging estructurado JSON por línea** (`config/securityLog.js`) en vez de una librería de
  logging nueva: eventos de auth, y ahora también `GET /products` y `POST /orders`, salen como
  JSON de una línea (`event`, `timestamp`, `status`, detalles) — fácil de grepear o enrutar a un
  colector externo más adelante sin agregar una dependencia.
- **`ErrorBoundary` por sección + uno global**: catálogo, carrito y checkout tienen cada uno un
  fallback específico y accionable en su contexto; un boundary global por fuera de todo cubre lo
  que los de sección no envuelven (login, historial de pedidos, header/footer) sin duplicar
  fallbacks para cada ruta.
- **`logEvent` del cliente manda al backend, no solo a consola** (`services/logService.js` →
  `POST /api/logs/client`): un error atrapado por un `ErrorBoundary` en el navegador de un usuario
  real no sirve de nada si solo queda en su consola — se reporta al mismo logger estructurado que
  ya usa el servidor. Es fire-and-forget: si el POST falla, no reintenta ni relanza, para que un
  logging caído nunca sea la causa de un segundo error.
- **`ENABLE_DOCS` gatea `/api-docs`**: la documentación Swagger/OpenAPI se genera siempre, pero
  solo se expone si la variable está activa (oculta en producción por defecto).
- **`npm audit --omit=dev` en 0 en ambos paquetes, no `npm audit` a secas**: `server` y `client`
  tienen 0 vulnerabilidades en dependencias que efectivamente corren en producción. Lo que queda
  (`server`: `vitest`/`vite`/`esbuild`, el test runner; `client`: `webpack-dev-server`/
  `workbox-build`/`rollup-plugin-terser`, el build tooling de Create React App) son
  `devDependencies` o herramientas de build que nunca se empaquetan ni llegan al navegador o
  proceso del usuario final. El único fix que ofrece `npm audit fix --force` para lo que resta es
  degradar `react-scripts` a una versión que no existe funcional, así que no se aplicó — no es
  descuido, es que forzarlo rompe el proyecto sin cerrar un riesgo real.

Historial completo de decisiones y hallazgos de auditoría (incluyendo la auditoría OWASP Top
10:2025 y su backlog de remediación): [`docs/backlog.md`](docs/backlog.md) y
[`docs/adrs/`](docs/adrs/).

---

## 6. Testing

Backend: `vitest` + `supertest` + `mongodb-memory-server` (DB en memoria, sin tocar Atlas).
Frontend: Testing Library + `user-event`, API interceptada con MSW.

```bash
cd server && npm test              # todo
cd server && npm run test:unit     # solo unit
cd server && npm run test:int      # solo integración (misma suite que test:api / test:endpoints)
cd server && npm run test:coverage

cd client && npm test
```

Estrategia completa (pirámide de tests, matriz de trazabilidad, datos de prueba, issues
conocidos): [`docs/testing/`](docs/testing/strategy.md).

---

## 7. Deployment

Dos servicios en Render: un **Web Service** (backend Express) y un **Static Site** (build de
Create React App). El deploy a producción hoy es manual (no hay auto-deploy en push a `main`,
ver `INFRA-003` en el backlog).

Guía paso a paso completa, variables de entorno de producción y configuración de CORS:
[`docs/render-deployment.md`](docs/render-deployment.md).

---

```
                                 /\
                                /  \
                               / /\ \
                              / /  \ \
                             / / /\ \ \
                            / / /  \ \ \
                           / / / /\ \ \ \
                          / / / /  \ \ \ \
                         / / / / /\ \ \ \ \
                        / / / / /  \ \ \ \ \
                       /____________________\
                      /                      \
                     /   ~~~~~~~~~~~~~~~~~~   \
                    /____________________________\
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                       Mount Fuji  |  富士山
```
