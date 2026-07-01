# Find Achievements — Casos de Uso

```mermaid
---
title: Find Achievements — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Ver catálogo completo con estado desbloqueado"]
    UC2["Filtrar logros desbloqueados desde fecha"]
    UC3["Ver progreso visual en perfil"]

    User --> UC1
    UC1 --> UC2
    UC1 --> UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT obligatorio |
| Respuesta | `{ key, category, sortOrder, unlockedAt }[]` |
| i18n | Títulos/descripciones en cliente (`achievements.i18n`) |
| Paridad | Keys alineadas con seed DB (`achievement-catalog-parity.spec.ts`) |
| Envelope | `{ data: AchievementUserViewEntry[] }` |
