# TEST PLAN — destroyyourself-api
**QA Senior · Vitest + mongodb-memory-server + supertest**
**Creado:** 2026-06-27 | **Última ejecución:** 2026-07-07 · 92/92 PASA (`npm test` en `server/`)

> **Nota (2026-07-07):** la matriz detallada de abajo quedó desactualizada respecto al código —
> los 10 archivos de `server/tests/` ya existen y pasan completos (92 tests). Las columnas
> "Estado" con ⬜ no reflejan el estado real; ver `docs/testing.md` para el reporte vigente de
> toda la suite (backend + frontend + Cypress). Se deja esta matriz como referencia histórica del
> diseño original, no como fuente de verdad del progreso.

---

## 1. Resumen ejecutivo

| Módulo | Unitarias | Integración | Total | Estado |
|---|---|---|---|---|
| `middlewares/authMiddleware` | 9 | — | 9 | ✅ completo |
| `middlewares/validate` | 5 | — | 5 | ✅ completo |
| `models/User` | 10 | — | 10 | ✅ completo |
| `models/Product` | 3 | — | 3 | ⬜ pendiente |
| `models/Order` | 2 | — | 2 | ⬜ pendiente |
| `controllers/auth` | — | 9 | 9 | ⬜ pendiente |
| `controllers/product` | — | 10 | 10 | ⬜ pendiente |
| `controllers/cart` | — | 7 | 7 | ⬜ pendiente |
| `controllers/order` | — | 13 | 13 | ⬜ pendiente |
| `controllers/category` | — | 4 | 4 | ⬜ pendiente |
| **TOTAL** | **27** | **43** | **70** | 24 implementados |

**Leyenda:** ⬜ pendiente · 🔄 en progreso · ✅ completo · ❌ bloqueado

### Nota técnica aprendida
`vi.hoisted()` es obligatorio para mocks de ES Modules con Vitest.
`process.env.JWT_SECRET` debe leerse en runtime (no como constante de módulo) porque `setup.js` lo setea en `beforeAll`, que corre después de la inicialización del módulo de test.

---

## 2. Setup y herramientas

### Dependencias a instalar
```bash
cd server
npm install -D vitest @vitest/coverage-v8 mongodb-memory-server supertest
```

### Archivos de infraestructura
| Archivo | Propósito |
|---|---|
| `vitest.config.js` | Configuración global: globals, coverage thresholds, setupFiles |
| `tests/setup.js` | MongoMemoryServer: beforeAll / afterEach / afterAll |
| `tests/helpers.js` | Factories: `createUser`, `createAdmin`, `createProduct`, `tokenFor` |

### Scripts en package.json
```json
"test":          "vitest run",
"test:watch":    "vitest",
"test:coverage": "vitest run --coverage",
"test:unit":     "vitest run tests/unit",
"test:int":      "vitest run tests/integration"
```

### Umbrales de cobertura (vitest.config.js)
| Métrica | Mínimo |
|---|---|
| Lines | 80 % |
| Functions | 80 % |
| Branches | 70 % |
| Statements | 80 % |

---

## 3. Estructura de archivos

```
server/tests/
├── setup.js                          ← bootstrap global
├── helpers.js                        ← factories y utilidades
├── unit/
│   ├── middleware.auth.test.js
│   ├── middleware.validate.test.js
│   ├── model.user.test.js
│   ├── model.product.test.js
│   └── model.order.test.js
└── integration/
    ├── auth.routes.test.js
    ├── product.routes.test.js
    ├── cart.routes.test.js
    ├── order.routes.test.js
    └── category.routes.test.js
```

---

## 4. Matriz de pruebas

### 4.1 Unitarias — Middlewares

#### `tests/unit/middleware.auth.test.js`

| # | Caso | Tipo | Estado |
|---|---|---|---|
| U-MW-01 | Sin header Authorization → 401 | negativo | ⬜ |
| U-MW-02 | Header sin prefijo "Bearer " → 401 | negativo | ⬜ |
| U-MW-03 | Token inválido/expirado → 401 | negativo | ⬜ |
| U-MW-04 | Token válido, usuario activo → `req.user` poblado, llama `next()` | positivo | ⬜ |
| U-MW-05 | `requireAdmin`: usuario con role "user" → 403 | negativo | ⬜ |
| U-MW-06 | `requireAdmin`: usuario con role "admin" → llama `next()` | positivo | ⬜ |

#### `tests/unit/middleware.validate.test.js`

| # | Caso | Tipo | Estado |
|---|---|---|---|
| U-VAL-01 | Sin errores de validación → llama `next()` | positivo | ⬜ |
| U-VAL-02 | Con errores → 400 + `{ errors: [...] }` | negativo | ⬜ |
| U-VAL-03 | No llama `next()` si hay errores | negativo | ⬜ |

---

### 4.2 Unitarias — Modelos

#### `tests/unit/model.user.test.js`

| # | Caso | Tipo | Estado |
|---|---|---|---|
| U-USR-01 | `pre save`: password se hashea al crear | positivo | ⬜ |
| U-USR-02 | `pre save`: re-hash NO ocurre si password no cambió | positivo | ⬜ |
| U-USR-03 | `comparePassword`: true con contraseña correcta | positivo | ⬜ |
| U-USR-04 | `comparePassword`: false con contraseña incorrecta | negativo | ⬜ |
| U-USR-05 | `toJSON`: no expone campo `password` en la respuesta | seguridad | ⬜ |

#### `tests/unit/model.product.test.js`

| # | Caso | Tipo | Estado |
|---|---|---|---|
| U-PRD-01 | Validación: `category` debe ser uno de los enums | negativo | ⬜ |
| U-PRD-02 | Validación: `price` mínimo 0 | negativo | ⬜ |
| U-PRD-03 | Defaults: `stock=1`, `isAvailable=true` | positivo | ⬜ |

#### `tests/unit/model.order.test.js`

| # | Caso | Tipo | Estado |
|---|---|---|---|
| U-ORD-01 | `paymentMethod` sólo acepta: efectivo / tarjeta / transferencia | negativo | ⬜ |
| U-ORD-02 | `status` default es "pending" | positivo | ⬜ |

---

### 4.3 Integración — Auth `POST /api/auth`

Archivo: `tests/integration/auth.routes.test.js`

| # | Caso | Método / Ruta | Status esperado | Estado |
|---|---|---|---|---|
| I-AUTH-01 | Registro exitoso con datos válidos | POST /register | 201 + `{ token, user }` | ⬜ |
| I-AUTH-02 | Registro con email ya existente | POST /register | 400 | ⬜ |
| I-AUTH-03 | Registro con email inválido (validación) | POST /register | 400 + `errors` | ⬜ |
| I-AUTH-04 | Registro con password < 6 chars | POST /register | 400 + `errors` | ⬜ |
| I-AUTH-05 | Login exitoso | POST /login | 200 + `{ token, user }` | ⬜ |
| I-AUTH-06 | Login con password incorrecta | POST /login | 401 | ⬜ |
| I-AUTH-07 | Login con email no registrado | POST /login | 401 | ⬜ |
| I-AUTH-08 | GET /me con token válido | GET /me | 200 + datos de usuario | ⬜ |
| I-AUTH-09 | GET /me sin token | GET /me | 401 | ⬜ |

---

### 4.4 Integración — Products `GET/POST/PATCH/DELETE /api/products`

Archivo: `tests/integration/product.routes.test.js`

| # | Caso | Método / Ruta | Status esperado | Estado |
|---|---|---|---|---|
| I-PRD-01 | Listar productos disponibles (paginación) | GET / | 200 + `{ products, pagination }` | ⬜ |
| I-PRD-02 | Filtrar por categoría válida | GET /?category=tops | 200 | ⬜ |
| I-PRD-03 | Filtrar por categoría inválida → lista vacía | GET /?category=xyz | 200, `products: []` | ⬜ |
| I-PRD-04 | Obtener producto por ID existente | GET /:id | 200 | ⬜ |
| I-PRD-05 | Obtener producto por ID inexistente | GET /:id | 404 | ⬜ |
| I-PRD-06 | Crear producto como admin | POST / | 201 | ⬜ |
| I-PRD-07 | Crear producto como user (no admin) | POST / | 403 | ⬜ |
| I-PRD-08 | Crear producto sin autenticación | POST / | 401 | ⬜ |
| I-PRD-09 | Actualizar producto como admin | PATCH /:id | 200 | ⬜ |
| I-PRD-10 | Eliminar producto como admin | DELETE /:id | 204 | ⬜ |

---

### 4.5 Integración — Cart `GET/POST/PATCH/DELETE /api/cart`

Archivo: `tests/integration/cart.routes.test.js`

| # | Caso | Método / Ruta | Status esperado | Estado |
|---|---|---|---|---|
| I-CART-01 | GET carrito vacío (primer acceso) | GET / | 200, `{ items: [] }` | ⬜ |
| I-CART-02 | Agregar item nuevo | POST /items | 200 + carrito con item | ⬜ |
| I-CART-03 | Agregar mismo producto+talla → incrementa cantidad | POST /items | 200, `quantity` incrementado | ⬜ |
| I-CART-04 | Actualizar cantidad de un item | PATCH /items/:itemId | 200 | ⬜ |
| I-CART-05 | Eliminar un item del carrito | DELETE /items/:itemId | 200, item removido | ⬜ |
| I-CART-06 | Limpiar carrito completo | DELETE / | 200, `items: []` | ⬜ |
| I-CART-07 | Todos los endpoints sin auth → 401 | * | 401 | ⬜ |

---

### 4.6 Integración — Orders `GET/POST/PATCH /api/orders`

Archivo: `tests/integration/order.routes.test.js`

| # | Caso | Método / Ruta | Status esperado | Estado |
|---|---|---|---|---|
| I-ORD-01 | Crear orden con stock suficiente | POST / | 201 + orden con total calculado | ⬜ |
| I-ORD-02 | Total calculado server-side (no acepta total del cliente) | POST / | 201, `total` = precio real | ⬜ |
| I-ORD-03 | Stock se decrementa tras crear orden | POST / | verificar `product.stock` | ⬜ |
| I-ORD-04 | Crear orden con stock insuficiente | POST / | 400 | ⬜ |
| I-ORD-05 | Crear orden con producto no disponible (`isAvailable=false`) | POST / | 400 | ⬜ |
| I-ORD-06 | Crear orden con paymentMethod inválido | POST / | 400 | ⬜ |
| I-ORD-07 | GET /me — listar mis órdenes | GET /me | 200 + array | ⬜ |
| I-ORD-08 | GET /:id — ver orden propia | GET /:id | 200 | ⬜ |
| I-ORD-09 | GET /:id — intentar ver orden ajena → 403 | GET /:id | 403 | ⬜ |
| I-ORD-10 | GET /all — admin ve todas las órdenes | GET /all | 200 | ⬜ |
| I-ORD-11 | GET /all — user normal → 403 | GET /all | 403 | ⬜ |
| I-ORD-12 | PATCH /:id/status — admin actualiza estado válido | PATCH /:id/status | 200 | ⬜ |
| I-ORD-13 | PATCH /:id/status — estado inválido | PATCH /:id/status | 400 | ⬜ |

---

### 4.7 Integración — Categories `GET /api/categories`

Archivo: `tests/integration/category.routes.test.js`

| # | Caso | Método / Ruta | Status esperado | Estado |
|---|---|---|---|---|
| I-CAT-01 | Listar categorías | GET / | 200 + array | ⬜ |
| I-CAT-02 | Crear categoría como admin | POST / | 201 | ⬜ |
| I-CAT-03 | Crear categoría como user → 403 | POST / | 403 | ⬜ |
| I-CAT-04 | Eliminar categoría como admin | DELETE /:id | 204 | ⬜ |

---

## 5. Ejecución

```bash
# Instalar dependencias de test (una vez)
cd server
npm install -D vitest @vitest/coverage-v8 mongodb-memory-server supertest

# Correr todos los tests
npm test

# Watch mode (desarrollo)
npm run test:watch

# Reporte de cobertura
npm run test:coverage

# Solo unitarias
npm run test:unit

# Solo integración
npm run test:int
```

---

## 6. Criterios de aceptación

| Criterio | Umbral |
|---|---|
| Cobertura de líneas | ≥ 80 % |
| Tests pasando | 100 % (cero fallos en CI) |
| Tiempo de suite completa | < 30 s |
| Sin dependencia de MongoDB Atlas real | ✅ (mongodb-memory-server) |
| Tests idempotentes (orden no importa) | ✅ (afterEach limpia colecciones) |

---

## 7. Progreso

Actualiza los estados en la columna **Estado** de cada tabla usando:
- ⬜ pendiente
- 🔄 en progreso
- ✅ completo
- ❌ bloqueado (anota el motivo)

**Progreso actual:** 92 / 92 tests implementados y pasando (ver nota al inicio del documento y `docs/testing.md`)
