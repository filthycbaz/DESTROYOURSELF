---
name: feature-flow
description: Flujo completo para implementar un feature nuevo. Sigue las 11 fases del SSDLC con los subagentes correspondientes.
---

# Feature Flow

Flujo para implementar un feature nuevo desde la solicitud hasta el cierre documental.
Tiempo estimado: varía por complejidad (XS: 1-2h / XL: varios días).

---

## Precondición

Antes de iniciar este flujo:
- El feature debe estar en `docs/backlog.md` con un ID asignado
- `main` debe estar limpio (`git status` sin cambios no committeados)
- El baseline debe existir si estamos en modo orquestado (ver SSDLC FASE 10.5)

---

## Flujo

```
[Usuario / orchestrator] → Solicitud de feature con ID de backlog
        ↓
[orchestrator] → FASE 0: Lee CLAUDE.md, docs/, backlog, spec existente si hay
        ↓
[orchestrator] → FASE 1: Clasifica como "feature" + invoca security-reviewer para STRIDE inicial
        ↓
[security-reviewer] → Tabla STRIDE completada para el módulo afectado
        ↓
[spec-writer] → FASE 2 + 3: Historia SMART + Spec completo en docs/specs/
                Si hay decisión de arquitectura: ADR en docs/adrs/
        ↓
[code-reviewer] → Revisa el spec (estado DRAFT → IN PROGRESS si aprueba)
        ↓
[orchestrator] → FASE 4: Crea la rama desde main
                git checkout -b feature/[nombre-corto]
        ↓
[frontend-builder] y/o [backend-builder] → FASE 5 + 6: Skill Audit + Implementación
        ↓
[builder(s)] → FASE 7: Quality gates (lint, type check, tests, build)
        ↓
[qa-test-designer] → FASE 8: Escribe/verifica tests que cubren los CAs
        ↓
[anti-hallucination-reviewer] → Verifica reporte del builder contra código real
        ↓
[code-reviewer] → FASE 9: Revisa el diff antes de abrir PR, emite veredicto
        ↓
[security-reviewer] → Revisa el diff si hay superficie de seguridad
        ↓
[pr-publisher] → Llena la plantilla y abre el PR con los datos ya producidos
        ↓
[tech-reviewer] → Audita el PR abierto: claims vs. evidencia, spec ↔ diff, riesgo de integración
        ↓
[orchestrator] → Evalúa .agents/checklists/definition-of-done.md
                 Merge a main solo si todo el DoD está en ✓
        ↓
[docs-keeper] → FASE 10: Actualiza docs/ afectados por el feature
        ↓
[spec-writer] → FASE 10: Cierra el spec (estado → DONE), completa Resultados y Matriz de Cierre
        ↓
[orchestrator] → Actualiza docs/backlog.md: pendiente → DONE
```

---

## Puntos de bloqueo

El flujo se detiene (no continúa al siguiente paso) si:

| Punto | Condición de bloqueo |
|-------|---------------------|
| Después de STRIDE | Hallazgo de severidad ALTA no mitigado en el spec |
| Después de revisión de spec | code-reviewer emite RECHAZADO |
| Después de quality gates | Algún gate falla |
| Después de anti-hallucination | Afirmaciones NO VERIFICADAS |
| Después de revisión pre-PR | code-reviewer o security-reviewer emite RECHAZADO |
| Después de auditoría de PR | tech-reviewer emite CAMBIOS |
| Al evaluar el DoD | Cualquier ítem en ✗ tras 3 iteraciones de re-despacho |

Cuando el flujo se bloquea: el orchestrator notifica al agente responsable con instrucciones específicas de corrección. No se salta el bloqueo.

---

## Artefactos que produce este flujo

| Artefacto | Ubicación | Responsable |
|-----------|-----------|-------------|
| Spec | `docs/specs/YYYY-MM-DD-feature-[nombre].md` | spec-writer |
| ADR (si aplica) | `docs/adrs/ADR-[N]-[nombre].md` | spec-writer |
| Reporte STRIDE | `docs/threat-models/[módulo].md` | security-reviewer |
| Código del feature | rama `feature/[nombre]` → main | builder(s) |
| Tests | `server/tests/` o `client/src/**/*.test.jsx` | qa-test-designer |
| PR publicado | GitHub, plantilla `.agents/templates/pr-template.md` | pr-publisher |
| Auditoría de PR | veredicto APTO/CAMBIOS | tech-reviewer |
| Docs actualizados | `docs/data-flow.md`, `docs/contracts/` | docs-keeper |
