# Matriz integral de pruebas — DestroyYourself

Generada auditando el código y los archivos de test reales el 2026-07-08. Todos los escenarios
marcados como `Implementado` fueron ejecutados en esta auditoría — ver `docs/testing/strategy.md`
§ "Resultado de ejecución" en el reporte final para los números agregados.

**Leyenda de estado:** Pendiente · En progreso · Implementado · Fallando · Bloqueado · No aplica.

No todos los escenarios requieren los 5 niveles — cuando un nivel dice "No aplica", la razón está
en la columna Notas.

| ID | Módulo | Escenario | Backend unit | API integración | Frontend | E2E | Prioridad | Estado |
|---|---|---|---|---|---|---|---|---|
| AUTH-001 | Registro | Registro exitoso | No | Sí (`I-AUTH-01`) | Sí (`LoginPage.test.jsx`) | Sí (`register.cy.js`) | Crítica | Implementado |
| AUTH-002 | Registro | Correo duplicado | No | Sí (`I-AUTH-02`) | Sí | Sí | Alta | Implementado |
| AUTH-003 | Registro | Email inválido (validación) | No | Sí (`I-AUTH-03`) | No — HTML5 nativo, no simulable en JSDOM (ver `known-issues.md`) | Sí (bloqueo de submit real) | Media | Implementado |
| AUTH-004 | Registro | Password < 6 caracteres | No | Sí (`I-AUTH-04`) | No aplica — el formulario no valida longitud mínima en cliente, solo `required` | No | Media | Implementado |
| AUTH-005 | Registro | Confirmación de contraseña no coincide | No | No aplica — el backend no recibe `confirmPassword`, es validación 100% de cliente | Sí | Sí | Alta | Implementado |
| AUTH-006 | Login | Login exitoso | No | Sí (`I-AUTH-05`) | Sí | Sí | Crítica | Implementado |
| AUTH-007 | Login | Credenciales incorrectas | No | Sí (`I-AUTH-06`, `I-AUTH-07`) | Sí | Sí | Alta | Implementado |
| AUTH-008 | Login | Generación de token JWT | No | Sí (implícito en `I-AUTH-05`, se valida `res.body.token`) | No aplica | No | Alta | Implementado |
| AUTH-009 | Login | Verificación de token (`GET /me`) | No | Sí (`I-AUTH-08`, `I-AUTH-09`) | No aplica — no hay página que use `/me` directamente | No | Media | Implementado |
| AUTH-010 | Sesión | Persistencia tras recargar | No | No aplica | No aplica (requiere navegador real) | Sí (`login.cy.js`) | Alta | Implementado |
| AUTH-011 | Sesión | Ruta protegida sin sesión → redirige a `/login` | No | No aplica (es lógica de router de cliente) | Sí (`PrivateRoute.test.jsx`) | Sí | Crítica | Implementado |
| AUTH-012 | Sesión | **Defecto DEF-03**: hard-reload en ruta protegida con sesión válida igual redirige | No | No aplica | Sí (`PrivateRoute.test.jsx`, test etiquetado como defecto) | Sí (`login.cy.js`, test etiquetado `[DEFECTO DEF-03]`) | — | Fallando *a propósito* (documenta un bug real, no un test roto — ver `known-issues.md`) |
| AUTH-013 | Autorización | `requireAdmin` bloquea a usuario no-admin | Sí (`U-MW-05`) | Sí (`I-PRD-07`, `I-CAT-03`) | No aplica — no hay UI de admin | No | Media | Implementado |
| PROD-001 | Productos | Listar con paginación | No | Sí (`I-PRD-01`) | Sí (`HomePage.test.jsx`) | Implícito | Alta | Implementado |
| PROD-002 | Productos | Filtrar por categoría | No | Sí (`I-PRD-02`, `I-PRD-03`) | Sí | No | Media | Implementado |
| PROD-003 | Productos | Detalle por ID | No | Sí (`I-PRD-04`, `I-PRD-05`) | Sí (`ProductDetailPage.test.jsx`) | Implícito | Alta | Implementado |
| PROD-004 | Productos | Crear (admin) | No | Sí (`I-PRD-06`) | No aplica | No | Baja | Implementado |
| PROD-005 | Productos | Crear sin auth / sin rol admin | No | Sí (`I-PRD-08`, `I-PRD-07`) | No aplica | No | Media | Implementado |
| PROD-006 | Productos | Actualizar / eliminar (admin) | No | Sí (`I-PRD-09`, `I-PRD-10`) | No aplica | No | Baja | Implementado |
| PROD-007 | Productos | Validación de precio (`min: 0`) | Sí (`U-PRD-02`) | No — no hay ruta que intente crear con precio negativo | No aplica | No | Media | Implementado |
| PROD-008 | Productos | Contrato de forma de respuesta (`GET /`) | No | Sí (`contracts.routes.test.js`) | No aplica | No | Media | Implementado |
| CAT-001 | Categorías | Listar solo activas | No | Sí (`I-CAT-01`) | Sí (indirecto, vía `HomePage.test.jsx`) | Implícito | Media | Implementado |
| CAT-002 | Categorías | Crear/eliminar (admin) | No | Sí (`I-CAT-02`, `I-CAT-04`) | No aplica | No | Baja | Implementado |
| CART-001 | Carrito | Agregar producto (anónimo, localStorage) | No aplica | No aplica | Sí (`ProductDetailPage.test.jsx`) | Sí | Crítica | Implementado |
| CART-002 | Carrito | Agregar producto (autenticado, API) | No | Sí (`I-CART-02`, `I-CART-03`) | No — cubierto vía `CheckoutPage.test.jsx` que mockea la respuesta de `GET /cart`, no el flujo completo de `addToCart` autenticado | Sí (`checkout.cy.js`, usa `cy.addProductToCart()`) | Crítica | Implementado |
| CART-003 | Carrito | Eliminar producto | No | Sí (`I-CART-05`) | Sí (`CartPage.test.jsx`) | Sí | Alta | Implementado |
| CART-004 | Carrito | Incrementar/disminuir cantidad | No | Sí (`I-CART-04`) | Sí | Sí | Alta | Implementado |
| CART-005 | Carrito | Prevenir cantidad < 1 | No | No — el backend no tiene esta regla explícita, `PUT /:itemId` acepta cualquier `quantity` entero; la prevención es 100 % de cliente | Sí (`CartPage.test.jsx`) | No | Media | Implementado (con nota: es una regla solo de UI, ver `known-issues.md`) |
| CART-006 | Carrito | Cálculo de subtotal | No | No aplica (el backend no devuelve subtotal, se calcula en cliente) | Sí | Sí | Crítica | Implementado |
| CART-007 | Carrito | Endpoints sin auth → 401 | No | Sí (`I-CART-07`) | No aplica | No | Alta | Implementado |
| CART-008 | Carrito | **Defecto DEF-02**: mensaje "inicia sesión" no llega a verse | No | No aplica | Sí (`CartPage.test.jsx`, test etiquetado como defecto) | No — no es un caso de negocio a probar, ya está caracterizado a nivel de componente | — | Fallando *a propósito* (documenta un bug real — ver `known-issues.md`) |
| CART-009 | Carrito | **Defecto DEF-01**: botón de tarjeta no agrega al carrito | No | No aplica | No — es un defecto de intención de UI, no de lógica testeable en RTL más allá de inspección manual | No aplica directamente — `cy.addProductToCart()` evita este botón a propósito (ver comentario en `cypress/support/commands.js`) | — | Documentado, no corregido (fuera de alcance) |
| ORD-001 | Órdenes | Crear orden con stock suficiente | No | Sí (`I-ORD-01`) | Sí (`CheckoutPage.test.jsx`) | Sí | Crítica | Implementado |
| ORD-002 | Órdenes | Total calculado en servidor (no confía en el cliente) | No | Sí (`I-ORD-02`) | No aplica | Sí (`checkout.cy.js`, valida el payload real de la request) | Crítica | Implementado |
| ORD-003 | Órdenes | Stock se decrementa tras crear orden | No | Sí (`I-ORD-03`) | No aplica | No — requeriría inspeccionar la DB desde Cypress, fuera de alcance de E2E | Alta | Implementado |
| ORD-004 | Órdenes | Stock insuficiente → 400 | No | Sí (`I-ORD-04`) | No | Sí (`checkout.cy.js`, mockeado con `cy.intercept`) | Crítica | Implementado |
| ORD-005 | Órdenes | Producto no disponible → 400 | No | Sí (`I-ORD-05`) | No | No | Media | Implementado |
| ORD-006 | Órdenes | Método de pago inválido → 400 | No | Sí (`I-ORD-06`) | No aplica — el `<select>`/radios del cliente solo permite los 3 valores válidos | No | Baja | Implementado |
| ORD-007 | Órdenes | Listar mis órdenes | No | Sí (`I-ORD-07`) | Sí (`OrdersPage.test.jsx`) | No — cubierto indirectamente por el flujo de checkout, no como caso propio | Alta | Implementado |
| ORD-008 | Órdenes | Ver detalle de orden propia | No | Sí (`I-ORD-09`) | Sí (`OrderDetailPage.test.jsx`) | No | Alta | Implementado |
| ORD-009 | Órdenes | Intentar ver orden ajena → 403 | No | Sí (`I-ORD-10`) | No aplica | No | Alta | Implementado |
| ORD-010 | Órdenes | Admin ve todas las órdenes / user normal → 403 | No | Sí (`I-ORD-11`, `I-ORD-12`) | No aplica | No | Media | Implementado |
| ORD-011 | Órdenes | Actualizar estado de orden (admin) | No | Sí (`I-ORD-13`... estado inválido) | No aplica | No | Baja | Implementado |
| ORD-012 | Órdenes | `status` inicial es `pending` | Sí (`U-ORD-02`) | Implícito en `I-ORD-01` | No aplica | No | Media | Implementado |
| ORD-013 | Órdenes | Contrato de forma de respuesta (`POST /orders`) | No | Sí (`contracts.routes.test.js`) | No aplica | No | Alta | Implementado |
| ORD-014 | Checkout | Carrito vacío no permite llegar al checkout | No aplica | No aplica | Sí (`CartPage.test.jsx` — sin botón de pago) | Sí (`checkout.cy.js`, Bloque 1) | Alta | Implementado |
| ORD-015 | Checkout | Campos de envío obligatorios | No | Sí (validators de `orderRoutes.js`, cubierto en `I-ORD-*` con payload incompleto — ver nota) | Sí (`toBeRequired()`) | Sí (bloqueo real de submit) | Alta | Implementado |
| ORD-016 | Checkout | Reload de confirmación no duplica la orden | No aplica | No aplica | No aplica | Sí (`checkout.cy.js`) | Crítica | Implementado |
| ORD-017 | Checkout | Doble click no crea dos órdenes | No aplica | No aplica | Sí (`CheckoutPage.test.jsx`, delay simulado) | Sí (`checkout.cy.js`, delay real) | Crítica | Implementado |
| ORD-018 | Checkout | Carrito se vacía tras confirmar compra | No aplica | Implícito (`DELETE /cart` ya cubierto en `I-CART-06`) | No | Sí (`checkout.cy.js`) | Alta | Implementado |
| VAL-001 | Utilidades | `express-validator` + middleware `validate` — sin errores → `next()` | Sí (`U-VAL-01`) | Implícito en todas las rutas con body válido | No aplica | No | Alta | Implementado |
| VAL-002 | Utilidades | `express-validator` — con errores → 400 + array de errores | Sí (`U-VAL-02`, `U-VAL-03`) | Implícito en `I-AUTH-03/04`, `I-ORD-*` con payload inválido | No aplica | No | Alta | Implementado |
| VAL-003 | Utilidades | Hash de password (`pre save`) | Sí (`U-USR-01`, `U-USR-02`) | No aplica | No aplica | No | Crítica | Implementado |
| VAL-004 | Utilidades | `comparePassword` | Sí (`U-USR-03`, `U-USR-04`) | Implícito en login | No aplica | No | Crítica | Implementado |
| VAL-005 | Utilidades | `toJSON` no expone password | Sí (`U-USR-05`) | Sí (`contracts.routes.test.js`) | No aplica | No | Crítica | Implementado |

**Nota sobre "No aplica" vs "No":** "No aplica" significa que el escenario no tiene sentido en ese
nivel (por ejemplo, un cálculo 100 % de cliente no tiene equivalente de backend). "No" significa
que sí tendría sentido probarlo ahí pero no está implementado todavía — ver `known-issues.md` para
la lista de esos gaps con su justificación de por qué no se cerraron en esta auditoría.

## Resumen por módulo

| Módulo | Escenarios | Implementados | Fallando a propósito (defectos documentados) |
|---|---|---|---|
| Auth / Sesión | 13 | 12 | 1 (AUTH-012, DEF-03) |
| Productos | 8 | 8 | 0 |
| Categorías | 2 | 2 | 0 |
| Carrito | 9 | 7 | 2 (CART-008 DEF-02, CART-009 DEF-01 — documentado, no aplica "fallando" en sentido estricto) |
| Órdenes / Checkout | 18 | 18 | 0 |
| Utilidades / validación | 5 | 5 | 0 |
| **Total** | **55** | **52 con test real pasando + 3 defectos documentados con test que caracteriza el comportamiento actual** | |
