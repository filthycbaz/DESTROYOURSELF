# Definition of Done — nivel de ciclo (orquestador)

Distinto de `frontend-dod.md` / `backend-dod.md` (autochequeo de cada builder antes de reportar)
y de `pr-checklist.md` (qué arma el builder antes de abrir el PR). **Este es el que evalúa el
orquestador (el main loop, Fable) al final de cada ciclo completo**, ítem por ítem, antes de
declarar cualquier trabajo como terminado.

Los gates de esta tabla son los reales de este repo — confirmados leyendo `package.json` de
`client/` y `server/`, y `.github/workflows/ci.yml`. No son gates genéricos.

---

## Checklist

| # | Ítem | Gate real (cómo se verifica) | Agente a re-despachar si sale ✗ |
|---|------|-------------------------------|----------------------------------|
| 1 | Backend: tests unitarios + integración pasan | `npm test` en `server/` (Vitest) | `backend-tester` |
| 2 | Backend: cobertura ≥ umbrales de `vitest.config.js` (80% líneas/funciones/statements, 70% branches) | `npm run test:coverage` en `server/` | `backend-tester` |
| 3 | Frontend: tests de componentes pasan | `npm run test:run` en `client/` (Jest/RTL) | `frontend-tester` |
| 4 | Frontend: build de producción compila sin errores | `npm run build` en `client/` con `CI=true` (eslint se trata como error) | `frontend-builder` |
| 5 | E2E: Cypress pasa contra el entorno efímero | `npm run test:e2e:ci` en `client/` (o `server/scripts/e2e-server.mjs` + `cypress run` manual) | `frontend-tester` o `backend-tester`, según de qué lado esté la falla |
| 6 | Tests nuevos auditados (sin tautologías, sin exceso de mocks, sin happy-path-only) | Veredicto de `test-reviewer` | `backend-tester` o `frontend-tester` (quien escribió el test señalado) |
| 7 | Revisión pre-PR aprobada | Veredicto de `code-reviewer` = APROBADO (o APROBADO CON CONDICIONES ya resueltas) | `frontend-builder` / `backend-builder` |
| 8 | Auditoría del PR ya abierto aprobada | Veredicto de `tech-reviewer` = APTO | El agente responsable del hallazgo (builder o tester, según lo que `tech-reviewer` señale) |
| 9 | Seguridad — solo si el cambio toca auth, rutas o datos de usuario | Veredicto de `security-reviewer` (rol en `.agents/roles/`) sin hallazgos de severidad ALTA | `backend-builder` / `frontend-builder` |
| 10 | PR completo, sin campos `FALTA:` pendientes | Reporte de `pr-publisher` — cero `FALTA:` sin resolver | El agente que debía producir ese dato faltante |
| 11 | Documentación actualizada si el cambio lo requiere | Reporte del rol `docs-keeper` (`.agents/roles/docs-keeper.md`) | `docs-keeper` |

Los ítems 1–5 son gates automáticos (comando real, resultado binario). Los ítems 6–11 son
veredictos de agentes — igual de verificables, pero requieren que el agente correspondiente haya
corrido sobre el estado actual del cambio, no sobre una versión anterior.

---

## Regla de cierre

Cualquier ítem que salga **✗** se re-despacha al agente mapeado en la tabla, con el hallazgo
específico que lo hizo fallar (no un re-despacho genérico de "revisá de nuevo").

**Tope: 3 iteraciones sobre el mismo ítem.** Si después de 3 rondas de re-despacho el mismo ítem
sigue en ✗, el orquestador **detiene el ciclo** y escala al usuario con:
- Qué ítem sigue bloqueado
- Qué se intentó en cada una de las 3 rondas
- Por qué no se resolvió (hipótesis del orquestador, si la tiene)

No se declara un trabajo como "terminado" con algún ítem en ✗ y el tope de iteraciones excedido —
se escala, no se reporta éxito parcial como éxito.

## Cuándo corre esta checklist

Al final de cada ciclo completo (feature-flow, bugfix-flow, o hotfix-flow) antes de que el
orquestador autorice el merge, y de nuevo después de que `pr-publisher` publica el PR (ítems 8 y
10 solo pueden evaluarse una vez que el PR existe).
