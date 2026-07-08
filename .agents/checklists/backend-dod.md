# Definition of Done — Backend

Checklist que el `backend-builder` debe completar antes de considerar un feature o bugfix listo.

---

## Funcionalidad

- [ ] Todos los CAs del spec están verificados con peticiones HTTP reales (curl, Thunder Client, Postman)
- [ ] El happy path devuelve el código HTTP correcto con el body esperado
- [ ] Los casos de error devuelven códigos HTTP semánticos (400, 401, 403, 404, 500)
- [ ] Los mensajes de error son útiles para el cliente sin revelar detalles internos

## Seguridad (no negociable)

- [ ] El `userId` de cualquier operación viene de `req.user._id` — nunca de `req.body`
- [ ] El total de órdenes se calcula desde la DB — nunca desde `req.body.total`
- [ ] Todas las rutas nuevas que modifican datos tienen middleware `auth` antes del handler
- [ ] No hay secrets hardcodeados en ningún archivo
- [ ] `.env` está en `.gitignore` y no se commiteó

## Validación de inputs

- [ ] Todas las rutas nuevas usan `express-validator` + middleware `validate.js`
- [ ] Los campos requeridos fallan con 400 si están ausentes
- [ ] Los formatos inválidos (email, ObjectId, etc.) fallan con 400 y mensaje descriptivo

## Convenciones

- [ ] Imports con `import` (ES Modules) — sin `require()`
- [ ] Controllers usan `async/await` con `try/catch` que llama a `next(err)`
- [ ] Respuestas con `res.status(XXX).json(...)` — sin `res.send()`
- [ ] No hay lógica de negocio en el router — solo middleware + llamada al controller

## Base de datos

- [ ] Los queries incluyen solo los campos necesarios (evitar devolver `__v`, password hash)
- [ ] Los índices necesarios para los queries nuevos están declarados en el schema
- [ ] Si hay operaciones que deben ser atómicas, está documentado el gap en el spec si no se usó transacción

## Testing

- [ ] Al menos un test de integración por endpoint nuevo usando `supertest` + `mongodb-memory-server`
- [ ] Tests de caso negativo: sin token (401), con token inválido (401), recurso de otro usuario (403/404)
- [ ] `npm test` pasa sin errores

## Calidad

- [ ] `node --check server/app.js` pasa sin errores de sintaxis
- [ ] El servidor inicia sin errores (aceptando el error de conexión a MongoDB si no hay URI en el entorno de prueba)
- [ ] No hay `console.log` de debug en el código committeado
