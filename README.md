# DestroyYourself

Aplicación fullstack con cliente en React y servidor en Express + MongoDB.

---

## Estructura del proyecto

```
destroyourself/
├── client/   → React (Create React App)
└── server/   → Express + MongoDB
```

---

## Requisitos previos

- Node.js v18+
- MongoDB corriendo localmente (o URI remota)
- npm

---

## Inicializar el servidor

```bash
cd server
npm install
```

Crea un archivo `.env` en `/server` con tus variables (plantilla completa en
[`server/.env.example`](server/.env.example)):

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/destroyourself
JWT_SECRET=tu_secreto
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Luego levanta en modo desarrollo:

```bash
npm run dev
```

El servidor corre en `http://localhost:3001`.

> Para poblar la base de datos con datos iniciales: `npm run seed`

---

## Inicializar el cliente

```bash
cd client
npm install
npm start
```

Ya existe `client/.env.development` con `REACT_APP_API_URL=http://localhost:3001/api`
(plantilla en [`client/.env.example`](client/.env.example)).

La app corre en `http://localhost:3000`.

---

## Variables de entorno y despliegue

Referencia completa de todas las variables (backend y frontend), validaciones y
configuración de CORS: [`docs/environment-variables.md`](docs/environment-variables.md).

Guía paso a paso para desplegar en Render (Web Service + Static Site):
[`docs/render-deployment.md`](docs/render-deployment.md).

---

## Scripts disponibles

| Directorio | Comando         | Descripción                        |
|------------|-----------------|------------------------------------|
| `server`   | `npm run dev`   | Servidor con hot-reload (nodemon)  |
| `server`   | `npm run seed`  | Poblar la base de datos            |
| `client`   | `npm start`     | Cliente en modo desarrollo         |
| `client`   | `npm run build` | Build de producción                |

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
