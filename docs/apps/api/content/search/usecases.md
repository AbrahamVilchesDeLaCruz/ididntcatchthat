# Search Flashcards — Casos de Uso

```mermaid
---
title: Search Flashcards — Casos de uso
---
graph TB
    User(["🧑 Usuario / Guest"])
    Teacher(["👨‍🏫 Teacher / Admin"])

    UC1["Ver catálogo (solo audio listo)"]
    UC2["Filtrar por categoría"]
    UC3["Ver flashcard individual"]
    UC4["Filtrar por audioStatus (cualquiera)"]

    User --> UC1
    User --> UC2
    User --> UC3
    Teacher --> UC1
    Teacher --> UC2
    Teacher --> UC3
    Teacher --> UC4
```

## Reglas de negocio

| Regla                                                           | Acción                                            |
| --------------------------------------------------------------- | ------------------------------------------------- |
| Usuario `user`/`guest` solo ve `audioStatus: ready`             | Filtro automático aplicado en use case según rol  |
| Teacher/Admin puede filtrar por cualquier `audioStatus`         | Útil para ver pendientes y fallidas en backoffice |
| Paginación obligatoria                                          | Default: `page=1`, `pageSize=20`                  |
| Respuesta incluye `meta: { total, page, pageSize, totalPages }` | Patrón envelope del proyecto                      |
