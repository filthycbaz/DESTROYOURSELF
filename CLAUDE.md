# DestroyYourself — Contexto del proyecto

Bazar de ropa urbana de segunda mano. Stack: React 19 (CRA) + Express 5 + MongoDB Atlas.

## Documentación técnica

Ver `AGENTS.md` para la referencia completa de modelos, rutas API y patrones de código.
Ver `docs/data-flow.md` para el mapa de persistencia (qué vive dónde y por qué).

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, React Router v7, Context API, fetch nativo |
| Backend | Node.js, Express 5, ES Modules |
| Base de datos | MongoDB Atlas (Mongoose 9) |
| Auth | JWT (7 días), Bearer token en localStorage |

## Estructura

```
destroyourself/
├── client/          → React (puerto 3000)
│   └── src/
│       ├── config/api.js     ← URL base de la API
│       ├── context/          ← AppContext (carrito) + AuthContext (sesión)
│       ├── services/         ← authService (localStorage + fetch)
│       └── pages/
├── server/          → Express (puerto 3001)
│   ├── controllers/
│   ├── middlewares/ ← authMiddleware + validate
│   ├── models/
│   └── routes/
└── docs/
```

## Comandos

```bash
# Backend
cd server && npm run dev      # nodemon app.js
cd server && npm run seed     # poblar la base de datos

# Frontend
cd client && npm start        # CRA dev server
```

## Variables de entorno

### server/.env (requerido)
```
PORT=3001
MONGO_URI=<uri de MongoDB Atlas>
JWT_SECRET=<secreto seguro>
```

### client/.env.development (ya existe)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Convenciones

- Backend usa ES Modules (`import/export`). No usar `require`.
- Todos los controladores: `async (req, res, next)` con `try/catch → next(error)`.
- Validación de inputs en rutas con `express-validator` + middleware `validate.js`.
- El total de la orden se calcula siempre en el servidor (`orderController.js`).
- El carrito se sincroniza con el backend cuando el usuario está autenticado.
- `API_URL` siempre se importa desde `client/src/config/api.js`. Nunca hardcodear.

## Métodos de pago disponibles

`efectivo` | `tarjeta` | `transferencia`

PayPal y OXXO no están integrados y no existen en la UI.

## Pendientes conocidos

Ver `docs/data-flow.md` y el backlog en `AGENTS.md`.
