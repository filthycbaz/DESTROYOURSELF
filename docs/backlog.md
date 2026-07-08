# Backlog del Proyecto — DestroyYourself

**Última actualización:** 2026-07-08
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
| TECH-002 | feature | Rate limiting en rutas públicas (GET /api/products, POST /api/auth) | BACKLOG | — |

## Media prioridad

| ID | Tipo | Descripción | Estado | Spec |
|----|------|-------------|--------|------|
| US-008 | feature | Panel de administración: gestión de productos (CRUD) | BACKLOG | — |
| US-009 | feature | Gestión de stock en panel de admin | BACKLOG | — |
| US-010 | feature | Actualización de estado de órdenes por admin | BACKLOG | — |
| TECH-006 | feature | Tests de frontend para el flujo autenticado de sincronización de carrito (`AppContext.syncCartOnLogin`) | BACKLOG | — |
| TECH-007 | infra | Resolver bloqueo de facturación de GitHub Actions (CI no corre en el remoto) | BACKLOG | — |

## Baja prioridad / largo plazo

| ID | Tipo | Descripción | Estado | Spec |
|----|------|-------------|--------|------|
| US-011 | feature | Recuperación de contraseña por email | BACKLOG | — |
| US-012 | feature | Integración con pasarela de pago real | BACKLOG | — |
| INFRA-002 | infra | Configuración de entorno de staging | BACKLOG | — |

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

---

## Gaps técnicos documentados (no son backlog, son deuda conocida)

Ver `docs/data-flow.md` sección `## Gaps abiertos` para el detalle completo.
