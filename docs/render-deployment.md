# Despliegue en Render

Dos servicios independientes: un **Web Service** para el backend (Express) y un
**Static Site** para el frontend (build estático de Create React App).

## Servicio backend — Web Service

| Campo | Valor |
|-------|-------|
| Root Directory | `server` |
| Install Command | `npm ci` (o `npm install`) |
| Build Command | *(ninguno — no hay paso de build, es Node plano)* |
| Start Command | `node server.js` |
| Runtime | Node |

Variables de entorno a configurar en Render:

```
NODE_ENV=production
MONGO_URI=<connection string de MongoDB Atlas>
JWT_SECRET=<secreto de producción, distinto al de desarrollo>
FRONTEND_URL=https://<nombre-del-static-site>.onrender.com
CORS_ALLOWED_ORIGINS=https://<nombre-del-static-site>.onrender.com
```

`PORT` no se configura manualmente — Render lo inyecta y `server/server.js` lo lee
vía `process.env.PORT` (ver `server/config/env.js`). El servidor escucha en
`0.0.0.0`, requisito para aceptar conexiones externas dentro del contenedor de
Render.

## Servicio frontend — Static Site

| Campo | Valor |
|-------|-------|
| Root Directory | `client` |
| Install Command | `npm ci` (o `npm install`) |
| Build Command | `npm run build` |
| Publish Directory | `build` |

Variable de entorno a configurar en Render (se usa en tiempo de build, no de
runtime):

```
REACT_APP_API_URL=https://<nombre-del-web-service>.onrender.com/api
```

Si se cambia esta variable después del primer deploy, hay que disparar un **nuevo
build** manualmente (Manual Deploy → Clear build cache & deploy) — Render no
reconstruye automáticamente solo por cambiar una env var de un Static Site.

## Orden recomendado de despliegue

1. Crear el Web Service (backend) primero y anotar su URL asignada por Render
   (`https://<algo>.onrender.com`).
2. Crear el Static Site (frontend) con `REACT_APP_API_URL` apuntando a esa URL
   del backend + `/api`.
3. Volver al Web Service y setear `FRONTEND_URL` y `CORS_ALLOWED_ORIGINS` con la
   URL real que Render asignó al Static Site.
4. Redeploy del backend para que tome las variables de CORS actualizadas.

## URLs de referencia

| Entorno | Frontend | Backend |
|---------|----------|---------|
| Local | `http://localhost:3000` | `http://localhost:3001` |
| Render | `https://<static-site>.onrender.com` | `https://<web-service>.onrender.com` |

## Verificación post-deploy

- `GET https://<web-service>.onrender.com/api/products` responde `200` con un
  header `Origin` del Static Site.
- Un request con un `Origin` no incluido en `CORS_ALLOWED_ORIGINS` recibe `403` con
  `{ "message": "Origen no permitido por CORS: ..." }` (ver el error handler en
  `server/app.js`).
- Login/registro/carrito/checkout funcionan de punta a punta contra el backend
  desplegado (ver `docs/data-flow.md` para el flujo completo).

## Pendiente real (no resoluble desde el repo)

Las URLs finales (`https://*.onrender.com`) las asigna Render al crear cada
servicio y no se conocen de antemano. `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS` y
`REACT_APP_API_URL` deben completarse manualmente con esos valores reales en el
dashboard de Render siguiendo el orden de la sección anterior.
