---
name: ssdlc
description: Workflow maestro del ciclo de desarrollo seguro de este proyecto. Resume el ciclo común a los tres flujos concretos y sirve de referencia para todos los agentes.
---

# SSDLC — Workflow maestro

`.agents/orchestrator.md` referencia este archivo como el protocolo operativo base. Este
documento no reemplaza a los tres flujos concretos — resume el ciclo que comparten y remite a
cada uno para el detalle específico.

**Rama de integración de este repo: `main`.** No existe una rama `develop` — los tres flujos
crean rama de trabajo directamente desde `main` y mergean de vuelta a `main`.

---

## El ciclo común

Todo trabajo en este repo, sin importar el tipo, pasa por las mismas fases en el mismo orden
relativo:

```
1. CLASIFICAR   → ¿feature / bugfix / hotfix / docs / security-patch?
        ↓
2. ESPECIFICAR  → spec-writer redacta (completo para feature, mínimo para bugfix/hotfix)
        ↓
3. RAMIFICAR    → orchestrator crea la rama desde main
        ↓
4. IMPLEMENTAR  → frontend-builder y/o backend-builder, siguiendo el spec
        ↓
5. VERIFICAR    → QA (test-planner / backend-tester / frontend-tester / test-reviewer)
                  + anti-hallucination-reviewer sobre el reporte del builder
        ↓
6. REVISAR      → code-reviewer (antes de abrir PR)
        ↓
7. PUBLICAR     → pr-publisher abre el PR con la plantilla llena
        ↓
8. AUDITAR      → tech-reviewer sobre el PR ya abierto
        ↓
9. CERRAR CICLO → orchestrator evalúa .agents/checklists/definition-of-done.md
                  Todo ✓ → merge a main + docs-keeper actualiza docs
                  Algún ✗ → re-despacho al agente mapeado (tope 3 iteraciones, luego escala)
```

Cuál flujo concreto usar según el tipo de trabajo:

| Tipo | Flujo | Diferencia clave respecto al ciclo común |
|------|-------|-------------------------------------------|
| `feature` | `.agents/workflows/feature-flow.md` | Ciclo completo, incluye STRIDE inicial y ADR si aplica |
| `bugfix` | `.agents/workflows/bugfix-flow.md` | Spec mínimo (antes/después), test de regresión obligatorio |
| `hotfix` | `.agents/workflows/hotfix-flow.md` | Rama y merge directo sobre `main`, security-reviewer obligatorio, sin refactors |

---

## Modelos y agentes

Ver `.claude/model-policy.md` para la política completa (Sonnet por defecto, Opus solo como
override de despacho, Haiku para transcripción mecánica, Codex como segunda opinión post-PR).

## Definition of Done

Ver `.agents/checklists/definition-of-done.md` — es lo que el orquestador evalúa al cierre de
cualquiera de los tres flujos, con el mapa ítem → agente de re-despacho y el tope de 3
iteraciones.
