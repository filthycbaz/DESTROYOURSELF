# ADR-001: Política de modelos y harness de agentes versionado

**Fecha:** 2026-07-08
**Estado:** ACEPTADO
**Deciders:** Usuario (dueño del repo) + main loop (Fable)
**Spec relacionado:** N/A — cambio de infraestructura de agentes, no de producto

---

## Contexto

El repo tenía un sistema SSDLC multi-agente bastante elaborado (`.agents/orchestrator.md` + 8
roles + 3 workflows + 3 checklists + 4 plantillas) y 4 agentes de testing reales e invocables en
`.claude/agents/`. Sin embargo:

1. **Nunca se había comiteado.** Todo `.agents/`, `.claude/`, y `AGENTS.md` existía solo en el
   working tree local — cualquier otra persona que clonara el repo no tenía nada de esto.
2. **No había política de modelos explícita.** 5 de 9 roles fijaban `claude-opus-4-8` en su
   frontmatter de forma permanente (orchestrator, spec-writer, code-reviewer, security-reviewer,
   anti-hallucination-reviewer), sin un documento que explicara el criterio ni permitiera ajustarlo
   sin editar cada archivo.
3. **Faltaban piezas para cerrar el ciclo:** no había forma de auditar un PR ya abierto (distinto
   de revisarlo antes de abrirlo), no había un agente que llenara la plantilla de PR sin inventar
   datos, y no existía un checklist de Definition of Done a nivel de ciclo completo con mapa de
   re-despacho por ítem.
4. **Inconsistencias internas:** `orchestrator.md` referenciaba `.agents/workflows/ssdlc.md`
   (no existía) y los 3 workflows asumían una rama `develop` que no existe en el repo real (solo
   `main`).
5. **No había forma de declarar herramientas de terceros (Codex) a nivel de equipo** — cualquier
   configuración de plugin quedaba atada a la máquina de quien la configurara.

## Opciones consideradas

### Opción 1: Todos los agentes en Opus
Simplifica la decisión (un solo nivel), maximiza la calidad de cada respuesta.

**Pros:**
- Sin ambigüedad sobre qué modelo usar

**Contras:**
- Costo y latencia innecesarios para tareas mecánicas (llenar una plantilla, escribir un test que
  sigue un patrón ya establecido)
- No refleja que la mayoría del trabajo de este repo (implementación siguiendo un spec aprobado,
  escritura de tests con convenciones ya definidas) no requiere el nivel de razonamiento de Opus

**Impacto de seguridad:** ninguno — es una decisión de costo/latencia, no de superficie de ataque.

---

### Opción 2: Todos los agentes en Sonnet, sin excepción
Más barato y rápido de forma uniforme.

**Pros:**
- Costo predecible y bajo

**Contras:**
- Las tareas de juicio real (revisión de seguridad STRIDE, veredictos de PR, decisiones de
  arquitectura ambiguas) pierden la opción de escalar cuando realmente hace falta más
  razonamiento — el resultado es peor exactamente en los casos donde más importa

**Impacto de seguridad:** riesgo de que `security-reviewer` pase por alto un hallazgo sutil por
usar un modelo insuficiente para el caso, sin ninguna vía de escalar.

---

### Opción 3: Asignación fija por rol (la que ya existía, implícita)
Cada agente declara su modelo de forma permanente según el tipo de tarea que hace en general.

**Pros:**
- Ya estaba diseñada así, con buen criterio original (Opus para juicio/verificación, Sonnet para
  implementación)

**Contras:**
- No distingue entre "esta instancia de la tarea es rutinaria" y "esta instancia tiene una
  ambigüedad real" — un `code-reviewer` revisando un cambio trivial de un typo paga el mismo costo
  que uno revisando un cambio de arquitectura compleja
- No hay ningún lugar donde esté escrito el criterio — es una convención implícita en el
  frontmatter de 9 archivos distintos, fácil de perder de vista o de aplicar de forma inconsistente
  al agregar un agente nuevo

**Impacto de seguridad:** ninguno directo, pero la falta de un criterio explícito hace más fácil
que un agente nuevo se agregue sin pensar el nivel correcto.

---

### Opción 4 (elegida): Sonnet por defecto + Opus solo como override de despacho
Todo agente declara `model: sonnet` en su frontmatter. Quien despacha (el main loop, Fable) puede
pedir explícitamente que una invocación puntual use Opus cuando detecta una duda real de
arquitectura o de interpretación del requerimiento, justificándolo en una línea en el brief de
despacho. Haiku se reserva para un conjunto explícito de tareas mecánicas (matriz SÍ/NO en
`.claude/model-policy.md`). Codex se declara a nivel de proyecto como segunda opinión consultiva,
nunca como gate.

**Pros:**
- El costo de Opus se paga cuando aporta valor real, no en cada invocación de un rol
  "tradicionalmente" de juicio
- El criterio queda escrito en un solo lugar (`.claude/model-policy.md`), no repartido e implícito
  en 9 frontmatters
- Haiku cubre trabajo puramente mecánico (llenar PR, marcar checkboxes de gates ya corridos) sin
  arriesgar que invente datos, porque su regla ("transcribe, no decide") está acotada a una matriz
  explícita, no a "usa tu criterio"

**Contras:**
- Depende de que quien despacha (Fable) use el override de Opus con buen juicio — si se abusa,
  se pierde el ahorro; si se subutiliza, se pierde calidad en casos que sí lo necesitaban
- Requiere mantener la matriz Haiku actualizada a medida que se agreguen plantillas nuevas

**Impacto de seguridad:** ninguno nuevo. `security-reviewer` sigue pudiendo escalar a Opus vía
override cuando el hallazgo lo amerite — de hecho gana flexibilidad respecto a la Opción 3, donde
estaba fijo en Opus siempre pero sin ningún mecanismo de escalar *más* si hiciera falta.

---

## Decisión

Se adopta la **Opción 4**. Es la que mejor equilibra costo con calidad: mantiene el criterio
original (juicio → más razonamiento) pero lo hace explícito, auditable, y ajustable por instancia
en vez de fijo por rol. Además resuelve directamente los gaps encontrados (PR abierto sin auditor
dedicado, plantilla de PR sin quien la llene sin inventar, DoD sin mapa de re-despacho) con dos
agentes nuevos (`tech-reviewer`, `pr-publisher`) diseñados con esta misma política desde el
inicio, en vez de heredar una asignación fija.

## Consecuencias

**Positivas:**
- Política de modelos legible en un solo documento, versionado, con matriz explícita para Haiku
- Dos agentes nuevos (`tech-reviewer`, `pr-publisher`) cierran el ciclo hasta el PR abierto, no
  solo hasta el PR revisado antes de abrir
- `docs/adrs/`, `.github/PULL_REQUEST_TEMPLATE.md`, y `.agents/checklists/definition-of-done.md`
  quedan versionados junto con el resto — cualquiera que clone el repo arranca con el mismo
  contexto
- Se corrigen dos inconsistencias preexistentes (`ssdlc.md` faltante, referencias a `develop`
  inexistente) como parte del mismo cambio, ya que tocaban directamente los archivos que se estaban
  actualizando de todas formas

**Negativas / deuda técnica:**
- `spec-writer`, `security-reviewer`, `docs-keeper`, y `anti-hallucination-reviewer` quedan como
  protocolo en prosa (no agentes reales invocables) — su frontmatter se actualiza a la nueva
  política, pero promoverlos a `.claude/agents/` queda fuera de este cambio (no era parte del
  mínimo pedido)
- El plugin Codex requiere un paso manual de instalación por persona — no es transparente al 100%,
  limitación real de la herramienta, no de esta decisión

**Riesgos aceptados:**
- Que el override de Opus se use de más o de menos según el criterio de quien despacha en cada
  caso — se mitiga exigiendo la justificación de una línea en el brief, que además queda como
  registro auditable de cuándo y por qué se usó

## Revisión

Este ADR debe revisarse si:
- Se decide promover alguno de los roles en prosa (`spec-writer`, `security-reviewer`,
  `docs-keeper`, `anti-hallucination-reviewer`) a agente real invocable
- El plugin Codex cambia su modelo de distribución (por ejemplo, si deja de requerir instalación
  manual por persona)
- Se crea una rama `develop` real y el repo vuelve a un flujo de dos ramas
