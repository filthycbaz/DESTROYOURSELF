# Variables de entorno

Toda configuración dependiente del entorno (URLs, orígenes CORS, puerto) vive en
variables de entorno. Nada de esto debe hardcodearse en el código — ver
`server/config/env.js` (backend) y `client/src/config/api.js` (frontend).

## Backend (`server/`)

Archivo local: `server/.env` (gitignored). Plantilla: `server/.env.example`.

| Variable | Obligatoria | Ejemplo local | Descripción |
|----------|:-----------:|----------------|-------------|
| `NODE_ENV` | No (default `development`) | `development` | `development` \| `test` \| `production`. Activa validaciones estrictas en `production`. |
| `PORT` | No (default `3001`) | `3001` | Puerto donde escucha Express. En Render lo asigna la plataforma. |
| `MONGO_URI` | Sí | `mongodb+srv://usuario:pass@cluster.mongodb.net/destroyYourself` | Cadena de conexión a MongoDB Atlas. |
| `JWT_SECRET` | Sí | `un-secreto-largo-y-aleatorio` | Firma y verifica los JWT de sesión. |
| `FRONTEND_URL` | Sí en producción | `http://localhost:3000` | URL del frontend desplegado. Referencia informativa (redirecciones futuras, logs). |
| `CORS_ALLOWED_ORIGINS` | Sí en producción | `http://localhost:3000` | Lista de orígenes permitidos por CORS, separados por comas. En desarrollo, si se omite, se asume `http://localhost:3000`. |

`server/config/env.js` centraliza la lectura y validación: si falta `MONGO_URI` o
`JWT_SECRET` el proceso lanza un error explícito al arrancar (excepto en `test`,
donde `mongodb-memory-server` provee su propia URI en tiempo de ejecución). Si
`NODE_ENV=production` y falta `FRONTEND_URL` o `CORS_ALLOWED_ORIGINS`, también falla
al arrancar — preferimos un crash inmediato y legible a un servidor corriendo con
CORS mal configurado.

## Frontend (`client/`)

Create React App expone solo variables prefijadas con `REACT_APP_`, inyectadas en
tiempo de build (no de runtime).

Archivos:
- `client/.env.development` — valores de `npm start` (versionado, sin secretos).
- `client/.env.test` — valores usados por `npm test` (versionado, sin secretos).
- `client/.env.example` — plantilla de referencia.
- `client/.env.production.local` — opcional, no versionado, para overrides locales de un build de producción.

| Variable | Obligatoria | Ejemplo local | Descripción |
|----------|:-----------:|----------------|-------------|
| `REACT_APP_API_URL` | Sí | `http://localhost:3001/api` | URL base de la API, **incluye** el prefijo `/api`. Usada por `client/src/config/api.js`, el único punto de acceso a esta variable en el código. |

Si `REACT_APP_API_URL` falta durante un build con `NODE_ENV=production` (el que usa
`npm run build`), la app lanza un error explícito al cargar en el navegador en vez
de apuntar silenciosamente a `localhost`. En desarrollo/test, si falta, cae a
`http://localhost:3001/api` con un `console.warn`.

> Importante: `REACT_APP_API_URL` se incrusta en el bundle durante el build. Si
> cambia la URL de la API (por ejemplo, tras redeployar el backend en Render con
> otro nombre de servicio), hay que **reconstruir y redesplegar el frontend** — no
> basta con cambiar la variable en el panel de Render sin disparar un nuevo build.

## Cómo agregar un nuevo origen permitido en CORS

1. Editar `CORS_ALLOWED_ORIGINS` en el entorno correspondiente (local: `server/.env`;
   Render: variables de entorno del servicio backend).
2. Formato: orígenes completos (`scheme://host[:puerto]`), sin trailing slash,
   separados por comas. Ejemplo: `https://mi-tienda.onrender.com,https://staging.mi-tienda.onrender.com`.
3. Reiniciar el proceso backend (en Render, cualquier cambio de variable de entorno
   dispara un redeploy automático).
4. No usar `*` — la configuración usa `credentials: true`, y CORS prohíbe combinar
   `origin: '*'` con credenciales.

## Notas sobre cookies y autenticación

Este proyecto **no usa cookies** para autenticación: el JWT viaja en el header
`Authorization: Bearer <token>` y se guarda en `localStorage` (ver
`docs/data-flow.md`). Por eso no aplican configuraciones de `sameSite`, `secure` o
`domain` en cookies. `credentials: true` está habilitado en CORS para dejar el
proyecto listo si en el futuro se migra a cookies `httpOnly` (mejora de seguridad
pendiente, documentada en `docs/data-flow.md`), pero hoy no cambia el comportamiento
del frontend porque ningún `fetch` envía `credentials: 'include'`.
