# Create Flashcard — Casos de Uso

```mermaid
---
title: Create Flashcard — Casos de uso
---
graph TB
    Teacher(["👨‍🏫 Teacher"])
    Admin(["🛡️ Admin"])

    UC1["Crear flashcard (formulario)"]
    E1["Ver error: subcategoría inválida"]
    E2["Ver error: demasiados ejemplos"]
    E3["Sin autorización (no teacher/admin)"]

    Teacher --> UC1
    Admin --> UC1
    UC1 -.->|"<<extend>>"| E1
    UC1 -.->|"<<extend>>"| E2
    UC1 -.->|"<<extend>>"| E3
```

## Reglas de negocio

| Regla                                                    | Acción                                                 |
| -------------------------------------------------------- | ------------------------------------------------------ |
| Solo `teacher` y `admin` pueden crear                    | 403 si rol no autorizado                               |
| La subcategoría debe pertenecer a la categoría           | `InvalidSubcategory` (422)                             |
| Entre 1 y 3 ejemplos obligatorios                        | `InvalidExampleCount` (422)                            |
| La flashcard se publica directamente (sin draft)         | `audioStatus: pending` desde el inicio                 |
| El audio se genera de forma asíncrona                    | `FlashcardCreatedEvent` → `AudioGenerationHandler`     |
| La flashcard es visible antes de que el audio esté listo | El cliente muestra skeleton si `audioStatus !== ready` |
