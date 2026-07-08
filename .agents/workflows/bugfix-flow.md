---
name: bugfix-flow
description: Flujo abreviado para corregir bugs. Más rápido que feature-flow pero sin omitir spec ni tests.
---

# Bugfix Flow

Flujo para corregir un bug reportado. Más corto que el feature flow pero igualmente riguroso en trazabilidad.

La diferencia clave: el spec de un bugfix describe el comportamiento incorrecto y el comportamiento correcto esperado. No es una historia de valor nuevo.

---

## Precondición

- El bug debe estar en `docs/backlog.md` o ser reportado con contexto suficiente
- El comportamiento incorrecto debe ser reproducible
- `main` debe estar limpio

---

## Flujo

```
[orchestrator] → Lee el reporte del bug + reproduce el comportamiento incorrecto
        ↓
[orchestrator] → Clasifica: ¿es un bug de seguridad? 
                Si sí → invoca security-reviewer primero (puede ser hotfix, no bugfix)
                Si no → continúa
        ↓
[spec-writer] → Redacta spec mínimo:
                - Comportamiento actual (incorrecto)
                - Comportamiento esperado (correcto)
                - CAs: al menos el happy path que estaba roto + el caso que lo demuestra
        ↓
[code-reviewer] → Revisa el spec (lectura rápida, no bloquear por formato)
        ↓
[orchestrator] → Crea rama: git checkout -b bugfix/[nombre-corto]
        ↓
[frontend-builder] o [backend-builder] → Implementa la corrección
        ↓
[builder] → Quality gates
        ↓
[qa-test-designer] → Escribe el test de regresión:
                     el test debe fallar antes de la corrección y pasar después
        ↓
[anti-hallucination-reviewer] → Verifica reporte del builder
        ↓
[code-reviewer] → Revisa el diff antes de abrir PR
        ↓
[pr-publisher] → Abre el PR con la plantilla llena
        ↓
[tech-reviewer] → Audita el PR abierto
        ↓
[orchestrator] → Evalúa .agents/checklists/definition-of-done.md → Merge a main si todo ✓
        ↓
[docs-keeper] → Actualiza docs si el bug revelaba una divergencia entre docs y código
        ↓
[spec-writer] → Cierra el spec (DONE)
```

---

## Regla del test de regresión

Para cada bugfix, el `qa-test-designer` debe producir un test que:
1. Falle con el código antes de la corrección (verificable en git history)
2. Pase con el código después de la corrección

Si no es posible escribir ese test, documentar por qué en el spec antes de continuar.

---

## Artefactos que produce este flujo

| Artefacto | Ubicación |
|-----------|-----------|
| Spec de bugfix | `docs/specs/YYYY-MM-DD-bugfix-[nombre].md` |
| Test de regresión | `server/tests/` o `client/src/**/*.test.jsx` |
| Código corregido | rama `bugfix/[nombre]` → main |
