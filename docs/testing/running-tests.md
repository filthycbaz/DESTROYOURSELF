# Cómo correr las pruebas — DestroyYourself

`client/` y `server/` son proyectos npm separados (no hay `package.json` en la raíz) — cada
comando se corre desde su propia carpeta.

## Backend (`server/`)

```bash
cd server

npm test                 # todo (unit + integración), una sola corrida
npm run test:unit        # solo server/tests/unit/
npm run test:int         # solo server/tests/integration/ (incluye contratos)
npm run test:watch       # modo watch, desarrollo
npm run test:coverage    # con reporte de cobertura (text + lcov + html en server/coverage/)
```

No requiere MongoDB Atlas ni `.env` — `tests/setup.js` levanta `mongodb-memory-server`
automáticamente.

## Frontend (`client/`)

```bash
cd client

npm test                 # modo watch (default de CRA)
npm run test:run         # una sola corrida, sin watch
npm run test:coverage    # con reporte de cobertura (client/coverage/)
```

No requiere backend corriendo — toda llamada a `fetch` está interceptada por MSW.

## E2E — Cypress (`client/`)

Requiere **ambos** servidores corriendo. Dos formas de levantarlos:

### Opción A — sin Atlas, con Mongo efímero (recomendada, la que se usa en CI)

```bash
# terminal 1 — API + Mongo en memoria + seed automático, sin tocar Atlas
cd server && npm run e2e:server

# terminal 2
cd client && npm start

# terminal 3
cd client && npm run cypress:open   # interactivo
cd client && npm run cypress:run    # headless
```

### Opción B — contra Atlas real (requiere `server/.env` configurado)

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm start

# terminal 3
cd client && npm run cypress:run
```

### Scripts de Cypress

```bash
npm run cypress:open      # modo interactivo
npm run cypress:run       # headless
npm run test:e2e          # alias de cypress:run
npm run test:e2e:headed   # headless con navegador visible (debugging)
npm run test:e2e:ci       # levanta el cliente (start-server-and-test) + corre Cypress —
                           # asume que el backend YA está corriendo por separado (ver CI)
```

## Todo junto (equivalente a lo que corre CI)

No hay un solo comando raíz — se corre en el orden real que usa
`.github/workflows/ci.yml` (los jobs `backend-tests` y `frontend-unit-tests` corren en paralelo
porque son independientes; ver `strategy.md` para la justificación):

```bash
# 1. Backend
cd server && npm run test:coverage

# 2. Frontend (puede correr en paralelo con el paso 1)
cd client && npm run test:coverage

# 3. Build de producción (depende de que el paso 2 haya pasado)
cd client && npm run build

# 4. E2E (depende de que 1 y 2 hayan pasado)
cd server && npm run e2e:server &        # background
npx wait-on http://localhost:3001/api/products
cd client && npm run test:e2e:ci
```

## Variables de entorno relevantes para testing

| Variable | Dónde | Para qué |
|---|---|---|
| `JWT_SECRET` | `server/scripts/e2e-server.mjs` la genera automáticamente si no está seteada | Firmar tokens en el entorno efímero de E2E |
| `CYPRESS_TEST_USER_EMAIL` / `CYPRESS_TEST_USER_PASSWORD` | Opcional, override de `cypress.config.js` | Cambiar el usuario que usan `cy.loginByApi()` sin tocar código |
| `CI=true` | Se setea automáticamente en GitHub Actions | CRA trata warnings de ESLint como errores en el build bajo esta variable |

Ningún test (backend, frontend o E2E) requiere `server/.env` con credenciales reales de Atlas —
todo corre contra bases de datos en memoria (`mongodb-memory-server`) o mocks (MSW).
