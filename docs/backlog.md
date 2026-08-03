# Backlog del Proyecto — DestroyYourself

**Última actualización:** 2026-08-03
**Baseline activo:** pendiente de declarar (ver `.agents/workflows/ssdlc.md` FASE 10.5)

---

## Leyenda de estados

| Estado | Descripción |
|--------|-------------|
| `BACKLOG` | Identificado, pendiente de priorizar |
| `READY` | Priorizado, con contexto suficiente para spec |
| `IN PROGRESS` | Spec creado, en implementación |
| `IN REVIEW` | PR abierto, en revisión |
| `DONE` | Mergeado y cerrado |
| `BLOCKED` | Detenido por dependencia o decisión pendiente |

---

## Alta prioridad

| ID | Tipo | Descripción | Estado | Spec |
|----|------|-------------|--------|------|
| SEC-001 | security | Migrar JWT de localStorage a httpOnly cookies | BACKLOG | — |
| TECH-001 | refactor | Envolver decremento de stock + Order.create en transacción MongoDB | BACKLOG | — |
| TECH-002 | feature | Rate limiting en rutas públicas (GET /api/products, POST /api/auth) — parcialmente cubierto por `SEC-003` (solo /api/auth; GET /api/products sigue sin límite) | BACKLOG | — |
| SEC-003 | security | Rate limiting en POST /api/auth/login y /register (auditoría OWASP A07) | IN REVIEW | [PR #7](https://github.com/filthycbaz/DESTROYOURSELF/pull/7) |
| SEC-004 | security | Resolver vulnerabilidades de `npm audit` en dependencias de producción — mongoose, qs, body-parser (auditoría OWASP A03) | IN REVIEW | [PR #8](https://github.com/filthycbaz/DESTROYOURSELF/pull/8) |
| SEC-005 | security | Whitelist de campos en `productController.updateProduct` — cierra mass assignment y la ruta hacia GHSA-664h-wqgq-64gw (auditoría OWASP A05) | IN REVIEW | [PR #8](https://github.com/filthycbaz/DESTROYOURSELF/pull/8) |
| SEC-006 | security | Logging de login fallido, token inválido/ausente y accesos admin rechazados (auditoría OWASP A09) | IN REVIEW | [PR #7](https://github.com/filthycbaz/DESTROYOURSELF/pull/7) |

## Media prioridad

| ID | Tipo | Descripción | Estado | Spec |
|----|------|-------------|--------|------|
| US-008 | feature | Panel de administración: gestión de productos (CRUD) | BACKLOG | — |
| US-009 | feature | Gestión de stock en panel de admin | BACKLOG | — |
| US-010 | feature | Actualización de estado de órdenes por admin | BACKLOG | — |
| TECH-006 | feature | Tests de frontend para el flujo autenticado de sincronización de carrito (`AppContext.syncCartOnLogin`) | BACKLOG | — |
| TECH-007 | infra | Resolver bloqueo de facturación de GitHub Actions (CI no corre en el remoto) | BACKLOG | — |
| SEC-007 | security | Agregar `helmet` para headers de seguridad (auditoría OWASP A02) | IN REVIEW | [PR #9](https://github.com/filthycbaz/DESTROYOURSELF/pull/9) |
| SEC-008 | security | Clasificar `CastError` en el error handler global → 400 en vez de 500, sin exponer el mensaje interno de Mongoose (auditoría OWASP A02/A10) | IN REVIEW | [PR #9](https://github.com/filthycbaz/DESTROYOURSELF/pull/9) |
| SEC-009 | security | Límite máximo de `quantity` por item en `POST /orders` (20, defensivo — el stock real ya lo valida `orderController`) (auditoría OWASP A06) | IN REVIEW | [PR #10](https://github.com/filthycbaz/DESTROYOURSELF/pull/10) |
| SEC-010 | security | Expiración más corta de JWT + mecanismo de revocación — decisión explícita: se deja en BACKLOG hasta diseñarlo junto con `SEC-001` (migrar a httpOnly cookies), son cambios que se pisan si se hacen por separado (auditoría OWASP A07) | BACKLOG | — |
| SEC-012 | security | Idempotencia en `POST /orders` (evitar órdenes duplicadas por doble-click/retry) — separado de `SEC-009` porque requiere infra nueva (Idempotency-Key + storage, ninguna existe hoy), no es un fix chico (auditoría OWASP A06) | BACKLOG | — |

## Baja prioridad / largo plazo

| ID | Tipo | Descripción | Estado | Spec |
|----|------|-------------|--------|------|
| US-011 | feature | Recuperación de contraseña por email | BACKLOG | — |
| US-012 | feature | Integración con pasarela de pago real | BACKLOG | — |
| INFRA-002 | infra | Configuración de entorno de staging | BACKLOG | — |
| INFRA-003 | infra | Activar auto-deploy en el Web Service de Render (hoy en manual — el merge a `main` no dispara deploy solo, hay que dispararlo a mano desde el dashboard) | BACKLOG | — |
| SEC-011 | security | Pinnear GitHub Actions a SHA de commit en vez de tag mayor (auditoría OWASP A08) | BACKLOG | — |

---

## Completados

| ID | Tipo | Descripción | Spec |
|----|------|-------------|------|
| US-001 | feature | Registro y login de usuarios con JWT | — |
| US-002 | feature | Catálogo de productos con filtro por categoría | — |
| US-003 | feature | Carrito persistente: localStorage (anónimo) + MongoDB (autenticado) | — |
| US-004 | feature | Sincronización de carrito al hacer login | — |
| US-005 | feature | Checkout con validación de stock y cálculo de total en servidor | — |
| US-006 | feature | Historial de órdenes del usuario (/orders) | — |
| US-007 | feature | Detalle de orden (/orders/:id) | — |
| TECH-003 | feature | Tests de integración para orderController | — |
| TECH-004 | feature | Tests de integración para cartController | — |
| TECH-005 | feature | Tests de componentes para CheckoutPage y CartPage | — |
| INFRA-001 | infra | Pipeline de CI/CD (GitHub Actions) | — |
| TECH-008 | feature | Documentación OpenAPI/Swagger de la API (`/api-docs`, gateado por `ENABLE_DOCS` — oculto en producción por defecto) | [PR #6](https://github.com/filthycbaz/DESTROYOURSELF/pull/6) |
| SEC-002 | security | Rotar credencial `admin@destroy.com` en producción (estaba con la password de seed `admin123`, hallazgo Crítico de la auditoría OWASP A07) | — (rotación manual en producción, sin cambio de código — ver `seed.js` para el origen del hallazgo) |

---

## Auditoría OWASP Top 10:2025 (2026-07-30)

Auditoría de solo lectura sobre la API de Express (`server/`) contra las 10 categorías del OWASP Top 10:2025. Los hallazgos quedan trackeados arriba como `SEC-002` a `SEC-011`. Resumen por categoría:

| Categoría | Estado al momento de la auditoría | ID(s) |
|---|---|---|
| A01 Broken Access Control | OK | — |
| A02 Security Misconfiguration | Parcial | `SEC-007`, `SEC-008` |
| A03 Software Supply Chain | Expuesto | `SEC-004` |
| A04 Cryptographic Failures | OK (con salvedad) | — |
| A05 Injection | Expuesto | `SEC-005` |
| A06 Insecure Design | Parcial | `SEC-009`, `TECH-001` (ya existente) |
| A07 Authentication Failures | Expuesto (Crítico) | `SEC-002`, `SEC-003`, `SEC-010` |
| A08 Data Integrity Failures | Parcial | `SEC-011` |
| A09 Logging & Alerting Failures | Expuesto | `SEC-006` |
| A10 Mishandling of Exceptional Conditions | Parcial | `SEC-008` |

---

## Gaps técnicos documentados (no son backlog, son deuda conocida)

Ver `docs/data-flow.md` sección `## Gaps abiertos` para el detalle completo.
