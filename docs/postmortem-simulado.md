# Postmortem simulado — sobreventa de stock en eshop.com

> **Este incidente es simulado**, escrito para el sprint de robustez del proyecto final. No
> ocurrió en producción real, pero está construido sobre una condición de carrera que sí existe
> hoy en el código (`TECH-001` en [`docs/backlog.md`](backlog.md)) — el objetivo es mostrar cómo
> se detectaría, diagnosticaría y prevendría con las herramientas agregadas en este sprint.

- **Fecha simulada:** 2026-08-24, 14:10–14:40 (hora local)
- **Servicio:** `eshop.com` (Web Service backend en Render + Static Site frontend)
- **Severidad:** Alta — venta de producto que no existía en stock, reclamos de clientes
- **Estado:** Resuelto (simulado) / prevención en curso

---

## 1. Qué rompió primero

Un producto con **1 unidad en stock** (una chamarra vintage, pieza única — típico del catálogo de
segunda mano de DestroyYourself) recibe **3 checkouts casi simultáneos** durante un pico de tráfico
(post promocionado en redes). Los tres `POST /api/orders` llegan al servidor con pocos
milisegundos de diferencia.

En [`orderController.js`](../server/controllers/orderController.js), `createOrder` valida stock
y crea la orden así:

```js
if (product.stock < item.quantity) { /* rechaza */ }
// ...
await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
// ...
const order = await Order.create({ ... });
```

La verificación (`product.stock < item.quantity`) y el decremento (`$inc`) **no están en una
transacción atómica**. Los tres requests leen `stock: 1` casi al mismo tiempo, los tres pasan la
validación, y los tres decrementan y crean orden. Resultado: **3 órdenes confirmadas para 1 unidad
real**, dos clientes van a recibir un email de cancelación después de haber "comprado" la pieza.

## 2. Impacto

- 2 de 3 clientes con orden confirmada que en realidad no se puede cumplir.
- Sin forma rápida de confirmar, desde afuera, si el backend estaba realmente arriba durante el
  pico (no existía `GET /api/health` en ese momento).
- Sin logs estructurados en `POST /orders`, reconstruir la secuencia exacta de los 3 requests
  (¿en qué orden llegaron?, ¿cuál vio qué valor de stock?) tomó revisar `console.error(err.stack)`
  genérico y los timestamps de MongoDB — mucho más lento de lo necesario.

## 3. Causa raíz (simulada, sobre una condición real del código)

**Race condition en la validación de stock**: el patrón "leer stock → decidir → escribir stock"
no es atómico. Bajo concurrencia, dos o más requests pueden leer el mismo stock antes de que
cualquiera de ellos lo escriba, y todos pasan la validación con el mismo valor obsoleto.

Esto está trackeado desde antes de este incidente simulado como `TECH-001` en el backlog:
> *"Envolver decremento de stock + Order.create en transacción MongoDB"* — `BACKLOG`.

El incidente simulado es, en otras palabras, lo que pasa si `TECH-001` sigue sin resolverse y el
tráfico concurrente aumenta.

## 4. Por qué no se detectó antes de que un cliente se quejara

- No había `GET /api/health` — nadie podía diferenciar "el backend está caído" de "el backend
  está lento" de "el backend respondió mal a un request específico" sin ver logs del proceso.
- `POST /orders` no dejaba rastro estructurado de éxito/rechazo/error — solo el stack trace crudo
  del error handler global, sin `timestamp`, `status` ni contexto de negocio (`orderId`, `userId`,
  producto involucrado) en un formato grepeable.
- No había `ErrorBoundary` en checkout: si el frontend hubiera recibido una respuesta inesperada
  durante el pico, el riesgo era pantalla blanca en vez de un mensaje claro al usuario.

## 5. Acciones de prevención

**Ya implementadas en este sprint** (cierran la parte de *detección*, no la causa raíz):

- `GET /api/health` (`{ status, uptime, timestamp }`) para confirmar en un vistazo si el proceso
  está arriba — ver [`server/routes/healthRoutes.js`](../server/routes/healthRoutes.js).
- Logs estructurados JSON (`event`, `timestamp`, `status`, detalles) en `GET /products` y
  `POST /orders`, incluyendo el motivo exacto de cada rechazo (`insufficient_stock`,
  `product_unavailable`, `product_not_found`) — ver `logSecurityEvent` en
  [`orderController.js`](../server/controllers/orderController.js) y
  [`productController.js`](../server/controllers/productController.js). Con esto, reconstruir la
  secuencia de los 3 requests del incidente simulado es un grep, no una investigación manual.
- `ErrorBoundary` con fallback propio en catálogo, carrito y checkout — ningún error de render deja
  al usuario con pantalla blanca durante un pico de tráfico o una respuesta inesperada del backend.

**Pendiente — cierra la causa raíz, no solo la detección** (queda en el backlog, fuera de alcance
de este sprint de robustez que no agrega features):

- `TECH-001`: envolver la lectura de stock + decremento + creación de orden en una transacción
  MongoDB (`session.withTransaction`), o mover la validación a una operación atómica
  (`findOneAndUpdate` con filtro `stock: { $gte: quantity }`) para que la condición de carrera
  deje de ser posible en vez de solo más fácil de diagnosticar.
- `SEC-012` (backlog): idempotencia en `POST /orders` para evitar además duplicados por
  doble-click/retry del propio cliente, un problema relacionado pero distinto.
