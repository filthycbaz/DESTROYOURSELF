# AGENTS.md

Este archivo tiene dos secciones:
1. **Arquitectura de subagentes** — roles, workflows y dónde vive cada archivo
2. **Referencia técnica del proyecto** — modelos, rutas y patrones de código reales

---

## Arquitectura de subagentes

Este repo tiene dos capas de agentes, distintas pero con la misma política de modelos
(`.claude/model-policy.md`):

1. **`.claude/agents/*.md`** — agentes reales, invocables directamente por el harness de Claude
   Code (`subagent_type`).
2. **`.agents/`** (`orchestrator.md` + `roles/` + `workflows/` + `checklists/` + `templates/`) —
   protocolo SSDLC en prosa. No son agentes invocables; describen el ciclo de trabajo que el main
   loop (Fable) sigue como orquestador y que los agentes reales ejecutan en cada paso.

### Orquestador

| Archivo | Propósito | Modelo |
|---------|-----------|--------|
| `.agents/orchestrator.md` | Punto de entrada único. Coordina el flujo, despacha trabajo, consolida, evalúa el Definition of Done. No implementa. | Lo asume el main loop (Fable) directamente — no se despacha como subagente |

### Roles especializados (`.agents/roles/`) — protocolo en prosa

| Archivo | Propósito | Modelo |
|---------|-----------|--------|
| `spec-writer.md` | Redacta specs SMART y ADRs antes de cualquier implementación | Sonnet (Opus solo como override de despacho) |
| `frontend-builder.md` | Implementa en `client/` — ver agente real equivalente abajo | Sonnet |
| `backend-builder.md` | Implementa en `server/` — ver agente real equivalente abajo | Sonnet |
| `qa-test-designer.md` | Diseña y escribe tests de los CAs del spec activo. Coordina con el clúster de testing (ver abajo) | Sonnet |
| `code-reviewer.md` | Revisa specs en estado DRAFT. Para revisar diffs pre-PR, usar el agente real equivalente abajo | Sonnet (Opus solo como override de despacho) |
| `security-reviewer.md` | Valida STRIDE. Bloquea si hay hallazgo de severidad ALTA | Sonnet (Opus solo como override de despacho) |
| `docs-keeper.md` | Mantiene `docs/` coherente con el código real | Sonnet |
| `anti-hallucination-reviewer.md` | Verifica afirmaciones de un builder antes de que exista PR. Para auditar un PR ya abierto, usar `tech-reviewer` | Sonnet (Opus solo como override de despacho) |

### Agentes reales (`.claude/agents/`)

| Archivo | Propósito | Modelo |
|---------|-----------|--------|
| `frontend-builder.md` | Implementador de `client/` — promovido desde el rol en prosa, requiere spec aprobado, no toca `server/` | Sonnet |
| `backend-builder.md` | Implementador de `server/` — promovido desde el rol en prosa, requiere spec aprobado, no toca `client/` | Sonnet |
| `code-reviewer.md` | Revisa el diff **antes** de abrir PR. Emite veredicto APROBADO/RECHAZADO/APROBADO CON CONDICIONES | Sonnet |
| `tech-reviewer.md` | Audita el PR **ya abierto**: claims vs. evidencia real, spec ↔ diff, riesgo de integración. Veredicto APTO/CAMBIOS | Sonnet |
| `pr-publisher.md` | Llena la plantilla de PR con datos ya producidos por otros agentes. Nunca inventa — campo sin dato: `FALTA:` | Haiku |
| `test-planner.md` | Genera TEST_PLAN.md priorizado. Solo lectura. | Sonnet |
| `backend-tester.md` | Escribe tests Express/Mongoose con mongodb-memory-server | Sonnet |
| `frontend-tester.md` | Escribe tests React con Testing Library + MSW | Sonnet |
| `test-reviewer.md` | Audita tests existentes. Reporta problemas a archivo:línea | Sonnet |

**QA como clúster, no como agente único:** "QA" no es un agente nuevo — es el conjunto
`test-planner` + `backend-tester` + `frontend-tester` + `test-reviewer`, coordinado por el main
loop según qué cambió (frontend, backend, o ambos). Es una decisión explícita, no un agente
faltante — ver `docs/adrs/ADR-001-modelo-y-harness-de-agentes.md`.

### Política de modelos

Ver `.claude/model-policy.md` para la política completa: Sonnet por defecto en todo agente, Opus
solo como override puntual en el despacho (nunca fijo en un frontmatter), Haiku para tareas
mecánicas con plantilla fija (matriz SÍ/NO explícita), Codex como segunda opinión consultiva
post-PR.

### Workflows

| Archivo | Cuándo usar |
|---------|-------------|
| `.agents/workflows/ssdlc.md` | Workflow maestro. Resume el ciclo común y remite a los tres de abajo. |
| `.agents/workflows/feature-flow.md` | Features nuevas — flujo completo |
| `.agents/workflows/bugfix-flow.md` | Bugs no críticos — flujo abreviado |
| `.agents/workflows/hotfix-flow.md` | Bugs críticos en producción — rama desde `main` |

Rama de integración de este repo: **`main`** (no existe `develop`).

### Definition of Done de ciclo

`.agents/checklists/definition-of-done.md` — lo evalúa el orquestador al cierre de cualquier
flujo, ítem por ítem, con mapa ítem → agente de re-despacho. Tope de 3 iteraciones por ítem, luego
se escala al usuario. Distinto de `frontend-dod.md`/`backend-dod.md` (autochequeo del builder) y
de `pr-checklist.md` (qué arma el builder antes de abrir PR).

### Reglas de negocio críticas (para los builders)

1. El total de una orden siempre se calcula desde precios en DB — nunca desde `req.body`
2. El `userId` viene de `req.user._id` del token JWT — nunca de `req.body`
3. El stock se verifica y decrementa en `orderController.createOrder` únicamente
4. Métodos de pago válidos: `efectivo`, `tarjeta`, `transferencia`
5. `API_URL` siempre desde `client/src/config/api.js` — nunca hardcodeada

---

## Referencia técnica del proyecto

Este archivo documenta la estructura real del proyecto. Está basado exclusivamente en el código fuente leído. No contiene sugerencias, mejoras ni trabajo pendiente.

---

## Skills del proyecto

Los skills están ubicados en `.claude/skills/`. El archivo `SSDLC_SystemPrompt.md` es el protocolo base obligatorio — se lee antes de cualquier tarea. Los demás son skills de dominio que se activan por contexto según su trigger.

### Protocolo base

| Archivo | Descripción |
|---------|-------------|
| `SSDLC_SystemPrompt.md` | Protocolo operativo SSDLC obligatorio. Se aplica a toda tarea que involucre código, configuración o documentación. Exige leer los skills del proyecto antes de actuar. |

### Backend

| Archivo | Scope | Trigger |
|---------|-------|---------|
| `Express + MongoDB.md` | backend | Cuando se trabaje con Express, MongoDB, MERN stack, APIs RESTful con Node.js, o autenticación JWT |
| `MongoDB Patterns.md` | backend | Cuando se diseñen schemas de MongoDB, se implementen relaciones entre documentos, o se optimicen queries |
| `API Best Practices.md` | backend | Cuando se diseñen APIs REST, se mencione API design, RESTful principles, API documentation, o production-ready APIs |
| `Node.js Best Practices.md` | backend | Cuando se trabaje con Node.js, se configure un proyecto backend, o se necesiten mejores prácticas de Node |

### Frontend

| Archivo | Scope | Trigger |
|---------|-------|---------|
| `React.md` | frontend | Cuando se trabaje con React, se creen componentes, se use hooks, o se mencione desarrollo de UI con React |
| `Frontend Design.md` | frontend | Cuando se diseñen interfaces, se mencionen design systems, atomic design, Tailwind, Material UI, o patrones de UI/UX |

### Workflow

| Archivo | Scope | Trigger |
|---------|-------|---------|
| `Git Workflow.md` | workflow | Cuando se trabaje con Git, control de versiones, commits, branches, o flujos de trabajo en equipo |
| `Testing Strategies.md` | workflow | Cuando se planee estrategia de testing, se configure CI/CD con tests, o se diseñe quality assurance |

---

## Estructura de directorios

### `server/`

```
server/
├── app.js
├── seed.js
├── .env
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── orderController.js
│   └── productController.js
├── middlewares/
│   └── authMiddleware.js
├── models/
│   ├── Cart.js
│   ├── Category.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
└── routes/
    ├── authRoutes.js
    ├── cartRoutes.js
    ├── categoryRoutes.js
    ├── orderRoutes.js
    └── productRoutes.js
```

### `client/src/`

```
client/src/
├── App.jsx
├── App.test.js
├── index.js
├── reportWebVitals.js
├── setupTests.js
├── components/
│   ├── CartItem.css
│   ├── CartItem.jsx
│   ├── Footer.css
│   ├── Footer.jsx
│   ├── Header.css
│   ├── Header.jsx
│   ├── PrivateRoute.jsx
│   ├── ProductCard.css
│   └── ProductCard.jsx
├── context/
│   ├── AppContext.jsx
│   └── AuthContext.jsx
├── data/
│   └── products.js
├── pages/
│   ├── CartPage.css
│   ├── CartPage.jsx
│   ├── CheckoutPage.css
│   ├── CheckoutPage.jsx
│   ├── ConfirmationPage.css
│   ├── ConfirmationPage.jsx
│   ├── HomePage.css
│   ├── HomePage.jsx
│   ├── LoginPage.css
│   ├── LoginPage.jsx
│   ├── ProductDetailPage.css
│   └── ProductDetailPage.jsx
├── services/
│   └── authService.js
└── styles/
    ├── App.css
    └── index.css
```

---

## Mapa de rutas API

Base URL del servidor: `http://localhost:3001`  
Base URL del cliente: `http://localhost:3000`  
CORS configurado con `origin: "http://localhost:3000"`.

### `/api/auth`

| Método | Path        | Auth | Admin |
|--------|-------------|------|-------|
| POST   | `/register` | No   | No    |
| POST   | `/login`    | No   | No    |
| GET    | `/me`       | Sí   | No    |

### `/api/products`

| Método | Path   | Auth | Admin |
|--------|--------|------|-------|
| GET    | `/`    | No   | No    |
| GET    | `/:id` | No   | No    |
| POST   | `/`    | Sí   | Sí    |
| PUT    | `/:id` | Sí   | Sí    |
| DELETE | `/:id` | Sí   | Sí    |

`GET /` acepta query params: `category` (string), `page` (default `1`), `limit` (default `10`).  
La respuesta es `{ products, pagination: { total, page, limit, totalPages } }`.

### `/api/categories`

| Método | Path   | Auth | Admin |
|--------|--------|------|-------|
| GET    | `/`    | No   | No    |
| GET    | `/:id` | No   | No    |
| POST   | `/`    | Sí   | Sí    |
| DELETE | `/:id` | Sí   | Sí    |

`GET /` devuelve solo categorías donde `isActive: true`.

### `/api/cart`

Todos los endpoints del cart pasan por `router.use(protect)` — todos requieren auth.

| Método | Path        | Auth | Admin |
|--------|-------------|------|-------|
| GET    | `/`         | Sí   | No    |
| POST   | `/`         | Sí   | No    |
| PUT    | `/:itemId`  | Sí   | No    |
| DELETE | `/:itemId`  | Sí   | No    |
| DELETE | `/`         | Sí   | No    |

`POST /` body: `{ product: ObjectId, size: String, quantity?: Number }`.  
`PUT /:itemId` body: `{ quantity: Number }`.

### `/api/orders`

| Método | Path           | Auth | Admin |
|--------|----------------|------|-------|
| GET    | `/all`         | Sí   | Sí    |
| PATCH  | `/:id/status`  | Sí   | Sí    |
| POST   | `/`            | Sí   | No    |
| GET    | `/me`          | Sí   | No    |
| GET    | `/:id`         | Sí   | No    |

`GET /all` y `PATCH /:id/status` están definidos antes de `/:id` en el router para evitar conflictos.  
`GET /:id` valida que `order.user.toString() === req.user._id.toString()` antes de responder.

---

## Modelos Mongoose

### `User` — `models/User.js`

```js
{
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true },
}
// timestamps: true
```

Hooks y métodos del schema:

- `userSchema.pre("save")` — hashea `password` con `bcrypt.hash(this.password, 10)` si `this.isModified("password")`.
- `userSchema.methods.comparePassword(candidatePassword)` — retorna `bcrypt.compare(candidatePassword, this.password)`.
- `userSchema.methods.toJSON()` — llama `this.toObject()`, hace `delete user.password`, retorna el objeto.

### `Product` — `models/Product.js`

```js
{
  name:        { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ["tops", "bottoms", "shoes", "caps", "accesorios"] },
  price:       { type: Number, required: true, min: 0 },
  image:       { type: String, required: true },
  description: { type: String, trim: true },
  sizes:       { type: [String], required: true },
  condition:   { type: String, enum: ["Excelente", "Muy bueno", "Como nuevo", "Bueno"], required: true },
  brand:       { type: String, trim: true },
  stock:       { type: Number, default: 1, min: 0 },
  isAvailable: { type: Boolean, default: true },
}
// timestamps: true
```

### `Category` — `models/Category.js`

```js
{
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  isActive:    { type: Boolean, default: true },
}
// timestamps: true
```

### `Cart` — `models/Cart.js`

```js
// cartItemSchema
{
  product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
  size:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
}

// cartSchema
{
  user:  { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: { type: [cartItemSchema], default: [] },
}
// timestamps: true
```

### `Order` — `models/Order.js`

```js
// orderItemSchema
{
  product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  size:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
}

// orderSchema
{
  user:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  items:  { type: [orderItemSchema], required: true },
  paymentMethod: {
    type: String,
    enum: ["efectivo", "tarjeta", "transferencia"],
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city:   { type: String, required: true },
    state:  { type: String, required: true },
    zip:    { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  total: { type: Number, required: true },
}
// timestamps: true
```

---

## Validadores

No existen archivos ni funciones de validación explícitas en el código fuente. El paquete `express-validator` está declarado en `client/package.json` pero no se usa en ningún archivo revisado.

La única validación presente es la que Mongoose aplica a nivel de schema (enums, required, min, minlength, unique).

---

## Patrón exacto de código

### Server — configuración base (`app.js`)

```js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth",       authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/cart",       cartRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
});
```

### Server — patrón de controlador

```js
const actionName = async (req, res, next) => {
  try {
    // lógica
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
```

Todos los controladores siguen exactamente este patrón. El error se delega siempre con `next(error)`.

### Server — patrón de ruta

```js
import express from "express";
const router = express.Router();

router.get("/",    handlerA);
router.post("/",   protect, requireAdmin, handlerB);
router.put("/:id", protect, requireAdmin, handlerC);

export default router;
```

### Server — middleware de autenticación (`authMiddleware.js`)

```js
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado, token requerido" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Usuario no encontrado o inactivo" });
  }
  req.user = user;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso restringido a administradores" });
  }
  next();
};
```

`requireAdmin` siempre va encadenado después de `protect`.

### Server — generación de token JWT

```js
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
```

El payload del token es `{ id, role }`.

### Server — operaciones Mongoose usadas

```js
Model.find(filter)                              // lista
Model.findById(id)                              // uno por id
Model.create(data)                              // crear
Model.findByIdAndUpdate(id, data, { new: true, runValidators: true }) // actualizar
Model.findByIdAndDelete(id)                     // eliminar
Model.countDocuments(filter)                    // contar para paginación
query.populate("items.product")                 // populate de subdocumentos
query.sort({ createdAt: -1 })                   // orden descendente
query.skip(skip).limit(limitNum)                // paginación
cart.items.id(itemId)                           // acceso a subdocumento por id
cart.items.filter(...)                          // eliminar item de array embebido
```

### Server — respuesta de error de recurso no encontrado

```js
if (!resource) return res.status(404).json({ message: "..." });
```

### Client — contexto de autenticación (`AuthContext.jsx`)

```jsx
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setAuth(isAuthenticated());
  }, []);

  // expone: { user, auth, login, logout, register }
};
```

### Client — contexto de carrito (`AppContext.jsx`)

```jsx
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cartData");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cart));
  }, [cart]);

  const itemKey = (item) => `${item._id ?? item.id}-${item.size}`;

  // expone: { cart, addToCart, updateQuantity, removeFromCart, clearCart, user: null }
};
```

El carrito persiste en `localStorage` bajo la clave `"cartData"`. La identidad de un item es `id + size`.

### Client — servicio de autenticación (`authService.js`)

```js
const API_URL = "http://localhost:3001/api";

// login y register guardan en localStorage:
localStorage.setItem("authToken", data.token);
localStorage.setItem("userData", JSON.stringify(data.user));

// helpers
export function getCurrentUser()  { return JSON.parse(localStorage.getItem("userData")); }
export function isAuthenticated() { return !!localStorage.getItem("authToken"); }
export function getAuthHeader()   {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

### Client — patrón de llamada autenticada al API

```js
const res = await fetch("http://localhost:3001/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  },
  body: JSON.stringify(orderData),
});
const data = await res.json();
if (!res.ok) { /* manejo de error */ }
```

### Client — rutas y layout (`App.jsx`)

```jsx
<AuthProvider>
  <AppProvider>
    <Router>
      <Layout />  {/* Header + <main> + Footer */}
    </Router>
  </AppProvider>
</AuthProvider>
```

Rutas definidas:

| Path           | Componente            | Protegida |
|----------------|-----------------------|-----------|
| `/`            | `HomePage`            | No        |
| `/product/:id` | `ProductDetailPage`   | No        |
| `/cart`        | `CartPage`            | No        |
| `/login`       | `LoginPage`           | No        |
| `/checkout`    | `CheckoutPage`        | Sí (PrivateRoute) |
| `/confirmation`| `ConfirmationPage`    | No        |

### Client — `PrivateRoute`

```jsx
export default function PrivateRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}
```

### Client — mapeo de método de pago (frontend → backend)

```js
const PAYMENT_METHOD_MAP = {
  card:     "tarjeta",
  transfer: "transferencia",
  paypal:   "efectivo",
  oxxo:     "efectivo",
};
```

### Client — identificación de productos

En todo el código cliente se usa el patrón `item._id ?? item.id` para resolver el id de un producto, ya que los objetos pueden venir del API (campo `_id`) o del estado local (campo `id`).

---

## Restricciones para el agente

- No sugerir mejoras de implementación.
- No proponer trabajo pendiente ni deuda técnica.
- No incluir recomendaciones de diseño, refactorización o arquitectura.
- No inventar rutas, modelos, validadores ni patrones que no existan en el código real.
- No agregar información ajena al código leído.
- No evaluar decisiones ya tomadas en el código.
