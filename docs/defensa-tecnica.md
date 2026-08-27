# Guion de defensa — ~3 minutos

> Guion hablado para la presentación ante evaluadores. Los tiempos son orientativos (ritmo normal
> de habla). Los bloques entre `[ ]` son acotaciones de qué mostrar en pantalla, no se leen en voz
> alta.

---

**[0:00 – 0:15] Qué es el proyecto**

"DestroyYourself es un bazar de ropa urbana de segunda mano, fullstack: React, Express, MongoDB.
Se los muestro rápido y después les cuento qué cambió en este sprint."

---

**[0:15 – 0:50] Feature tour**

`[mostrar la app en vivo: home → detalle de producto → carrito → checkout → confirmación → /orders]`

"Catálogo con filtro por categoría — acá, `tops`, `bottoms`, `shoes`. Entro a un producto, elijo
talla, lo agrego al carrito. El carrito se guarda en `localStorage` si no estás logueado, y se
sincroniza a MongoDB apenas hacés login — no se pierde nada al pasar de anónimo a autenticado.
Checkout valida el stock y calcula el total **en el servidor**, nunca confía en lo que manda el
navegador. Y una vez confirmada la orden, queda en `/orders` con su historial y detalle."

---

**[0:50 – 1:20] Arquitectura**

"Por debajo: React 19 con Context API para sesión y carrito, Express 5 con controladores
`async/try-catch → next(error)`, Mongoose sobre MongoDB Atlas. Un par de decisiones concretas:
el total de la orden se calcula siempre server-side, `updateProduct` usa una whitelist de campos
en vez de aceptar el body crudo — cierra mass assignment —, y el JWT vive en `localStorage`, una
decisión pragmática que está documentada como deuda de seguridad conocida, no como olvido."

---

**[1:20 – 1:55] El desafío — qué rompe primero**

`[mostrar docs/postmortem-simulado.md]`

"Para no hablar en abstracto sobre robustez, armamos un postmortem simulado sobre una condición de
carrera real que ya estaba trackeada en nuestro backlog. Si dos clientes compran casi al mismo
tiempo la última unidad de una pieza única, el código de hoy puede confirmarle la compra a los
dos, porque la lectura de stock y el decremento no son atómicos. No lo arreglamos en este
sprint —es una feature de concurrencia, y este sprint es de robustez de manejo de errores, no de
lógica de negocio nueva—, pero sí construimos las herramientas para **detectarlo y diagnosticarlo
rápido** la próxima vez que pase. Eso es lo que sigue."

---

**[1:55 – 2:45] Qué se construyó este sprint**

"Cinco piezas, todas defensivas:

`[mostrar client/src/components/ErrorBoundary.jsx y App.jsx]`
`ErrorBoundary` por sección —catálogo, carrito, checkout— con un fallback específico a cada
contexto, más uno global por fuera de todo para lo que las secciones no cubren.

`[mostrar server/routes/healthRoutes.js, hacer GET /api/health]`
Un healthcheck real: `GET /api/health` devuelve estado, uptime y timestamp sin tocar la base de
datos, así que responde aunque Mongo esté caído.

`[mostrar logs en terminal de POST /orders o GET /products]`
Logging estructurado en el servidor: cada `GET /products` y `POST /orders` deja una línea de JSON
con evento, status y el detalle que importa.

Cuarto: esos mismos logs ahora también salen del **cliente** — cuando un `ErrorBoundary` atrapa un
error, se lo manda al backend con `POST /api/logs/client`, no se queda solo en la consola del
navegador de un usuario que nunca nos va a mandar ese log.

`[pausar el backend, recargar la app]`
Y quinto, esto lo pueden ver en vivo: paro el servidor y recargo — el catálogo no se cae, muestra
'no se pudo conectar con el servidor'. Cada fetch ya tenía try/catch antes de este sprint; el
`ErrorBoundary` cubre lo que un try/catch no puede, errores de render."

---

**[2:45 – 3:05] Documentación y cierre**

"Todo esto está en el [`README`](../README.md) reorganizado en las siete secciones que se esperan
de un proyecto en producción, con las decisiones técnicas explicadas, no solo implementadas.

En resumen: no tocamos ninguna feature, pero cerramos la brecha entre 'la app funciona en la demo'
y 'la app sobrevive un día real de tráfico real'. Gracias."

---

## Preguntas esperables (preparadas, no leer en voz alta durante la presentación)

- **"¿Por qué no arreglaron la condición de carrera del postmortem?"** — Porque es una feature de
  concurrencia (transacción Mongo), y el alcance de este sprint era robustez de manejo de errores,
  no cambios de lógica de negocio. Quedó explícito en el backlog como `TECH-001`.
- **"¿El healthcheck depende de Mongo?"** — No, a propósito: si dependiera de la DB, no podríamos
  usarlo para distinguir 'el proceso está caído' de 'la DB está caída pero el proceso vive'.
- **"¿Por qué reusar `logSecurityEvent` para logs que no son de seguridad?"** — Es la misma
  necesidad (JSON estructurado por línea, grepeable) resuelta una sola vez, en vez de tener dos
  loggers distintos para el mismo formato.
- **"¿Qué pasa si `POST /api/logs/client` también está caído cuando el `ErrorBoundary` intenta
  mandar el log?"** — `logEvent` es fire-and-forget: si el `fetch` falla, se descarta en silencio,
  sin reintentar ni relanzar. Perder un log nunca puede ser la causa de un segundo error.
- **"¿Por qué el `npm audit` no está en cero?"** — Sí lo está para lo que importa:
  `npm audit --omit=dev` da 0 en server y en client. Lo que queda son herramientas de build/test
  (`vitest`/`vite` en server, `react-scripts`/CRA en client) que nunca se empaquetan ni llegan al
  usuario final — forzar el fix ahí rompe el proyecto sin cerrar un riesgo real.
