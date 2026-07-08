## Descripción
[Qué se hizo y por qué, en 2-3 oraciones. Qué problema resuelve o qué valor agrega.]

## Spec
`docs/specs/[YYYY-MM-DD]-[tipo]-[nombre-corto].md`

## Tipo de cambio
- [ ] Feature
- [ ] Bugfix
- [ ] Hotfix
- [ ] Refactor
- [ ] Security patch
- [ ] Docs
- [ ] Infra

## Criterios de aceptación verificados

| CA | Descripción | Estado |
|----|-------------|--------|
| CA-1 | [descripción del CA] | ✅ Cumplido / ❌ No cumplido / ⚠️ Parcial |
| CA-2 | | |

## Quality Gates

- [ ] Type check — sin errores
- [ ] Lint — sin errores
- [ ] Tests — todos pasan (`npm test`)
- [ ] Diff revisado — sin secrets, sin console.log de debug
- [ ] Prueba funcional — CAs verificados manualmente

## Revisiones requeridas

- [ ] `code-reviewer` — veredicto: [APROBADO / RECHAZADO / APROBADO CON CONDICIONES]
- [ ] `security-reviewer` — aplica si toca auth, rutas o datos de usuario: [APROBADO / N/A]
- [ ] `anti-hallucination-reviewer` — afirmaciones verificadas: [APROBADO / BLOQUEADO]
- [ ] `tech-reviewer` (audita el PR ya abierto) — veredicto: [APTO / CAMBIOS]

## Consideraciones de seguridad
[Amenazas STRIDE evaluadas. Si no aplica ninguna: "Cambio no afecta superficie de seguridad."]

## Pendientes y gaps detectados durante la implementación
[Referencia a la sección "Pendientes Abiertos" del spec, o "Ninguno".]

## Backlog derivado creado
- [ ] Sí — referencias: [IDs o títulos]
- [ ] No aplica

## Breaking changes
[Ninguno | descripción de qué rompe y cómo migrarlo]

## Archivos modificados
[Lista de los archivos principales tocados, para facilitar la revisión]
