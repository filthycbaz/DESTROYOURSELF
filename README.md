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

Crea un archivo `.env` en `/server` con tus variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/destroyourself
JWT_SECRET=tu_secreto
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

La app corre en `http://localhost:3000`.

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
