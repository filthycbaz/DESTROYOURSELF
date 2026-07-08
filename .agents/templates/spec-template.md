# Spec: [Nombre descriptivo]

## Metadata
- **ID:** [ID del backlog — ej. US-001, BUG-012, TECH-003]
- **Tipo:** feature | bugfix | refactor | hotfix | security-patch | docs | infra
- **Complejidad:** XS | S | M | L | XL
- **Fecha:** YYYY-MM-DD
- **Estado:** DRAFT → IN PROGRESS → IN REVIEW → DONE | REJECTED
- **Asignado a:** orchestrator | spec-writer | frontend-builder | backend-builder

## Historia
Como [rol del usuario],
quiero [qué acción puede realizar],
para [qué valor o problema resuelve].

## Contexto
[Por qué existe esta tarea. Qué problema resuelve o qué valor agrega.
Incluir referencias a docs/data-flow.md, contratos de API u otros specs relacionados si aplica.]

## Criterios de Aceptación
- [ ] CA-1: [resultado observable y verificable — incluir código HTTP si es API, comportamiento de UI si es frontend]
- [ ] CA-2: [al menos un CA negativo — qué pasa cuando el input es inválido o el usuario no tiene permiso]

## Consideraciones de Seguridad
- **Amenazas STRIDE identificadas:** [lista o "Ninguna"]
- **Controles de mitigación:** [lista o "No aplica"]
- **Inputs que requieren validación:** [lista o "No aplica"]
- **Secrets involucrados:** [ninguno | cómo se manejan]
- **Superficie de ataque afectada:** [descripción o "No aplica"]

## Dependencias
- **Internas:** [módulos o servicios del proyecto]
- **Externas:** [librerías o servicios externos]
- **Specs relacionados:** [IDs de specs que deben completarse antes]

## Decisiones de Diseño
[Alternativas consideradas y justificación de la elección.
Si la decisión amerita un ADR, referenciar: docs/adrs/ADR-[N]-[nombre].md]

## Riesgos y Deuda Técnica
[Qué puede salir mal. Qué queda pendiente conscientemente.]

---

## Pendientes Abiertos y Gaps Detectados
*(Completar durante la implementación. Si no aplica, escribir "No aplica" con justificación.)*

### Funcionalidades faltantes
[Qué no pudo completarse en esta iteración y por qué]

### Comportamientos inconsistentes detectados
[Qué inconsistencias aparecieron durante la implementación o los tests]

### Gaps entre frontend y backend
[Divergencias en contratos, tipos o validaciones entre capas]

### Persistencia pendiente de migrar
[Datos o estructuras que requieren migración futura]

### Decisiones aplazadas
[Decisiones de diseño o seguridad diferidas explícitamente]

### Trabajo fuera de alcance en esta iteración
[Qué se excluyó conscientemente y por qué]

### Riesgos que requieren seguimiento
[Riesgos técnicos, de seguridad o de negocio sin mitigar]

### Items para backlog
- [ ] [descripción accionable]

---

## Matriz de Cierre
*(Completar al cerrar el spec.)*

| Item detectado | Estado | Acción |
|----------------|--------|--------|
| [descripción] | Implementado | Cerrar |
| [descripción] | Parcial | Crear backlog |
| [descripción] | Fuera de alcance | Archivar |

---

## Resultados
*(Completar al cerrar el spec. Todos los campos obligatorios.)*

- **Fecha de cierre:**
- **Estado final:** DONE | REJECTED

### Criterios de Aceptación
| CA | Descripción | Estado |
|----|-------------|--------|
| CA-1 | [descripción] | Cumplido / No cumplido / Parcial |

### Archivos modificados
- [ruta/al/archivo.js]

### Deuda técnica generada
[Descripción o "Ninguna"]

### Lecciones aprendidas
[Qué decisión resultó incorrecta o qué suposición falló]

### Backlog derivado creado
- **¿Se creó backlog derivado?** Sí | No
- **Referencias:** [IDs o títulos]
