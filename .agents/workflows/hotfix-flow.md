---
name: hotfix-flow
description: Flujo de emergencia para bugs críticos en producción. Más corto pero igual de riguroso en seguridad.
---

# Hotfix Flow

Flujo para correcciones críticas que no pueden esperar el ciclo normal de feature/bugfix.

**Cuándo usar este flujo (y no el bugfix-flow):**
- El bug está en producción y causa pérdida de datos, acceso no autorizado, o la app es inutilizable
- El bug afecta la seguridad del sistema

**Cuándo NO usar este flujo:**
- El bug es molesto pero no crítico — usar bugfix-flow
- La urgencia es percibida, no real — la prisa es la causa más común de nuevos bugs

---

## Flujo

```
[orchestrator] → Confirma que es un hotfix real (criterios de arriba)
        ↓
[security-reviewer] → Evalúa si el bug tiene implicaciones de seguridad
                      (siempre — los hotfixes tienen mayor probabilidad de ser bugs de seguridad)
        ↓
[spec-writer] → Spec mínimo viable (puede ser más corto, pero debe existir):
                - Descripción del bug en producción
                - Comportamiento esperado después del fix
                - CAs mínimos (al menos: no regresión + fix verificado)
        ↓
[orchestrator] → Crea rama desde MAIN (no desde develop):
                git checkout main && git pull origin main
                git checkout -b hotfix/[nombre-corto]
        ↓
[backend-builder] o [frontend-builder] → Implementa la corrección mínima
                                          No agregar features. Solo el fix.
        ↓
[anti-hallucination-reviewer] → Verifica el reporte
        ↓
[code-reviewer] → Revisión enfocada en correctitud y no-regresión
        ↓
[pr-publisher] → Abre el PR con la plantilla llena
        ↓
[tech-reviewer] → Audita el PR abierto (riesgo de integración con especial atención — un hotfix
                  mal auditado es el escenario de mayor costo)
        ↓
[orchestrator] → Evalúa .agents/checklists/definition-of-done.md → Merge a MAIN + tag de versión
                git checkout main && git merge hotfix/[nombre]
                git tag -a v[X.Y.Z+1] -m "hotfix: [descripción]"
                git push origin main --tags
        ↓
[docs-keeper] → Actualiza docs si el hotfix reveló una divergencia
        ↓
[spec-writer] → Cierra el spec (DONE)
```

---

## Reglas específicas del hotfix

1. La rama sale de `main` (única rama de integración de este repo — no existe `develop`)
2. El cambio debe ser el mínimo necesario — no es el momento de refactorizar
3. El `security-reviewer` es obligatorio — no opcional como en el bugfix-flow
4. `tech-reviewer` audita el PR con el mismo rigor que cualquier otro flujo — la urgencia no es
   excusa para saltarlo

---

## Artefactos

| Artefacto | Ubicación |
|-----------|-----------|
| Spec de hotfix | `docs/specs/YYYY-MM-DD-hotfix-[nombre].md` |
| Tag de versión | `git tag v[X.Y.Z+1]` en `main` |
| Test de regresión | `server/tests/` o `client/src/**/*.test.jsx` |
| PR publicado + auditoría | GitHub, veredicto de `tech-reviewer` |
