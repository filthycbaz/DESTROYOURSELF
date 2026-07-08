# Caso de prueba: [nombre descriptivo]

**Módulo:** [archivo o componente bajo prueba]
**Tipo:** happy path | negativo | borde | regresión
**CA relacionado:** CA-[N] del spec [nombre-del-spec]
**Prioridad:** Alta | Media | Baja
**Agente que lo implementa:** backend-tester | frontend-tester

---

## Precondición

[Estado del sistema antes de ejecutar el test.
Ejemplo: "Existe un usuario con email test@test.com y password 123456 en la DB de prueba"]

## Pasos

1. [Primer paso concreto]
2. [Segundo paso]
3. [...]

## Input

```json
{
  "campo": "valor de prueba"
}
```

## Resultado esperado

**HTTP status:** [código esperado, si aplica]

**Body esperado:**
```json
{
  "campo": "valor esperado"
}
```

**Estado del sistema después:** [qué cambió en la DB o en el estado de la UI]

## Resultado en caso negativo (si aplica)

[Qué debe pasar cuando el input es inválido, falta el token, el recurso no existe, etc.]

---

## Notas de implementación

[Instrucciones específicas para el agente que escribirá el test:
- Si es backend: qué usar de mongodb-memory-server, qué seed data crear
- Si es frontend: qué mock de MSW configurar, qué elemento buscar en la UI]
