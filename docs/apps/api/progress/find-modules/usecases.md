# Find Modules Progress — Casos de Uso

```mermaid
---
title: Find Modules Progress — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Ver progreso de todos los módulos"]
    UC2["Ver módulos sin progreso (vacío)"]

    User --> UC1
    User --> UC2

    note1["Ordenado por masteryLevel DESC\nSolo módulos con al menos 1 intento"]
    UC1 -.- note1
```

## Reglas de negocio

| Regla | Actor | Acción |
|---|---|---|
| Solo usuarios autenticados con JWT | User | `JwtAuthGuard` — 401 si no hay token |
| Devuelve lista vacía si no hay progreso | User | `[]` — no es un error |
| Ordenado por `masteryLevel` DESC | Sistema | Módulos más avanzados primero |
| Solo módulos en los que el usuario ha jugado aparecen | Sistema | No se pre-crea `ModuleProgress` — se crea al `GameCompleted` |
