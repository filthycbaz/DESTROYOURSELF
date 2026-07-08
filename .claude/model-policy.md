# Política de modelos y agentes — DestroyYourself

Este documento es la fuente de verdad de qué modelo usa cada agente y por qué. Se aplica a las
dos capas de agentes que existen en este repo (ver `AGENTS.md` para el detalle de cada una):

1. **`.claude/agents/*.md`** — agentes reales, invocables por el harness de Claude Code.
2. **`.agents/roles/*.md`** — protocolo SSDLC en prosa (no son agentes invocables; es
   documentación que describe el ciclo de trabajo del equipo). La política de modelos aplica
   igual a su frontmatter, aunque ningún runtime lo consuma directamente — es el mismo criterio,
   documentado en el mismo lugar, para que no haya dos políticas distintas.

## Principio rector

El main loop (Fable, razonamiento máximo) **solo orquesta**: planea, despacha trabajo a
subagentes, y arbitra entre reportes cuando hay contradicciones. **Nunca implementa código
directamente.** Sin un spec o un plan aprobado por el usuario, no se ejecuta nada — esto ya era
la regla de `.agents/orchestrator.md` ("No implementas código... no tomas decisiones de
arquitectura de forma unilateral"); aquí se hace explícito también como regla de modelo, no solo
de comportamiento.

## Niveles

| Nivel | Uso | Regla |
|---|---|---|
| **Fable** (main loop) | Orquestación: planear, despachar, arbitrar reportes contradictorios, autorizar merge | Nunca implementa ni escribe código de producción directamente |
| **Sonnet** | Default de **todos** los subagentes en `.claude/agents/*.md` | `model: sonnet` explícito en el frontmatter — no es opcional, no se omite el campo |
| **Opus** | Override puntual **en el momento del despacho**, nunca fijo en la definición de un agente | Solo cuando quien despacha (Fable) detecta una duda real de arquitectura o de interpretación del requerimiento — se anota en el brief de despacho con una línea de justificación (`Override a Opus: [por qué]`) |
| **Haiku** | Tareas mecánicas, con plantilla fija y salida verificable contra una fuente de datos ya producida | Ver matriz SÍ/NO abajo. Regla dura: **"Haiku transcribe, no decide."** |
| **Codex** (plugin `codex@openai-codex`) | Segunda opinión **consultiva**, después de abrir el PR | Nunca es gate único — sus hallazgos se anotan en el PR, no bloquean por sí solos. El veredicto que bloquea o aprueba sigue siendo el de `code-reviewer` (pre-PR) y `tech-reviewer` (PR abierto) |

**Por qué no hay Opus fijo:** antes de este cambio, 5 de los 9 roles en `.agents/roles/`
(orchestrator, spec-writer, code-reviewer, security-reviewer, anti-hallucination-reviewer)
fijaban Opus en su frontmatter de forma permanente. Eso es correcto como *default razonable* para
tareas de juicio, pero como política fija no distingue entre "esta revisión es rutinaria" y "esta
revisión tiene una ambigüedad real de arquitectura". Se reemplaza por: Sonnet por defecto siempre,
Opus solo cuando el despachador decide explícitamente que hace falta — así el costo de Opus se
paga cuando aporta, no en cada invocación. El razonamiento completo está en
`docs/adrs/ADR-001-modelo-y-harness-de-agentes.md`.

## Matriz Haiku — SÍ/NO

Basada en las plantillas y convenciones **reales** de este repo (no genérica):

| Tarea | SÍ/NO | Por qué |
|---|---|---|
| Llenar `.agents/templates/pr-template.md` (y su espejo `.github/PULL_REQUEST_TEMPLATE.md`) con datos ya producidos por otros agentes/reportes | **SÍ** | Transcripción campo a campo de una plantilla fija |
| Marcar los checkboxes de "Quality Gates" del PR según el resultado real de `npm test` / `npm run build` / Cypress ya ejecutado | **SÍ** | Copiar un resultado observado (pass/fail), no interpretarlo |
| Redactar el mensaje de commit siguiendo el patrón `tipo: descripción corta` que ya usa este repo (ver `git log`) | **SÍ** | Patrón mecánico observable, no requiere criterio |
| Actualizar `docs/backlog.md` marcando un ID como `DONE` cuando `spec-writer` ya cerró el spec correspondiente | **SÍ** | Transcripción de un estado ya decidido por otro agente |
| Dejar un campo del PR vacío + `FALTA: [qué falta y de quién]` cuando no hay dato fuente | **SÍ, es la regla por defecto** | Si el dato no vino de un reporte previo, Haiku no lo inventa — nunca. Casilla sin marcar es siempre preferible a un dato inventado |
| Redactar la sección "Consideraciones de seguridad" del PR cuando `security-reviewer` no corrió | **NO** | Requiere síntesis de un análisis que no existe — no hay nada que transcribir |
| Escribir o interpretar un spec, un ADR, o un criterio de aceptación (CA) | **NO** | Es una decisión de diseño |
| Decidir a qué CA corresponde un cambio ambiguo | **NO** | Es juicio, no transcripción |
| Emitir cualquier veredicto (APROBADO/RECHAZADO/APTO/CAMBIOS/BLOQUEADO) | **NO** | Es evaluación, no transcripción — incluso si el veredicto "parece obvio" |

Si en el futuro se agregan plantillas nuevas (changelog, índice de specs, etc.) con la misma
propiedad — campos fijos, fuente de datos ya producida por otro agente — se agregan a esta matriz
con el mismo criterio, no se asume que Haiku puede manejarlas por analogía.

## Codex — declaración y límites reales

Se declara a nivel de proyecto en `.claude/settings.json` (`extraKnownMarketplaces` +
`enabledPlugins`) para que cualquiera que abra y confíe en este repo reciba el *prompt* de
instalación del marketplace/plugin automáticamente. **Esto no es 100% automático**: cada persona
del equipo todavía necesita completar la instalación una vez (`/plugin install
codex@openai-codex`) cuando Claude Code se lo ofrezca — no hay forma de saltarse ese paso desde la
configuración del repo. Se documenta así para no prometer más de lo que la herramienta realmente
hace.

Codex se invoca **después** de que el PR está abierto, como una segunda mirada independiente. Sus
hallazgos se agregan como comentario/anotación en el PR. Nunca reemplaza ni bloquea por sí solo el
veredicto de `code-reviewer` o `tech-reviewer`.

## Aplicación a los agentes reales (`.claude/agents/`)

Ver tabla completa en `AGENTS.md`. Resumen: los 4 agentes de testing existentes
(`test-planner`, `backend-tester`, `frontend-tester`, `test-reviewer`) y los 5 agentes
nuevos/promovidos (`frontend-builder`, `backend-builder`, `code-reviewer`, `tech-reviewer`,
`pr-publisher`) usan `model: sonnet`, salvo `pr-publisher`, que usa `model: haiku` por ser
puramente mecánico. Ninguno fija `model: opus`.
