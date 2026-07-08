# Checklist de Pull Request

Completar antes de abrir el PR. El orchestrator verifica que todos los ítems estén marcados.
Para lo que pasa **después** de abrir el PR (auditoría de `tech-reviewer`, gates de CI, tope de
iteraciones), ver `.agents/checklists/definition-of-done.md`.

---

## Preparación

- [ ] La rama viene de `main` actualizado (`git pull origin main` antes de crear la rama)
- [ ] Existe un spec en `docs/specs/` en estado `IN PROGRESS` para este pendiente
- [ ] El título del PR describe el cambio en 1 línea (imperativo, conciso)

## Código

- [ ] El diff solo contiene cambios relacionados al spec — nada fuera de alcance
- [ ] No hay archivos de entorno (`.env`, `.env.local`) incluidos en el diff
- [ ] No hay secrets visibles (tokens, passwords, keys) en ningún archivo modificado
- [ ] No hay `console.log` de debug que no corresponde al flujo de producción
- [ ] No hay código comentado que sea "por si acaso"

## Tests

- [ ] Todos los tests existentes pasan (`npm test`)
- [ ] Los CAs del spec tienen al menos un test que los verifica
- [ ] Hay al menos un caso negativo por cada regla de autorización o validación nueva

## Revisiones

- [ ] `anti-hallucination-reviewer` — reporte entregado y veredicto APROBADO
- [ ] `code-reviewer` — veredicto APROBADO o APROBADO CON CONDICIONES
- [ ] `security-reviewer` — aplica si hay cambios en auth, rutas o datos de usuario

## Documentación

- [ ] El spec tiene los campos de Resultados comenzando a completarse
- [ ] Los pendientes detectados durante la implementación están en el spec
- [ ] Si hay endpoints nuevos o modificados: el contrato está en `docs/contracts/`

## Template del PR

- [ ] Se usó `.agents/templates/pr-template.md` como base (`pr-publisher` lo llena con datos ya
      producidos por los pasos anteriores — no inventa campos; ver `.claude/model-policy.md`)
- [ ] La tabla de CAs tiene el estado de cada uno
- [ ] La sección de breaking changes está completada (aunque sea "Ninguno")
- [ ] No quedan campos `FALTA:` sin resolver

---

## Bloqueantes automáticos (el orchestrator no hace merge si alguno aplica)

- Veredicto RECHAZADO de `code-reviewer`
- Veredicto BLOQUEADO de `anti-hallucination-reviewer`
- Hallazgo de severidad ALTA de `security-reviewer`
- Tests fallando
- Secret detectado en el diff
