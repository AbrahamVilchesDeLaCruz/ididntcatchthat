# Find Subcategories Progress — Casos de Uso

```mermaid
---
title: Subcategory Progress — Casos de uso
---
graph TB
    User(["🧑 Usuario Registrado"])

    UC1["Ver precisión agregada por subcategoría"]
    UC2["Ver lista vacía sin intentos en game"]

    User --> UC1
    User --> UC2
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | JWT obligatorio — 401 sin token |
| Agregación | `GROUP BY f.category, f.subcategory` desde `user_flashcard_stats` + join `flashcards` |
| Filtro | `HAVING SUM(times_played) > 0` — solo subcategorías con al menos un intento |
| Accuracy | `correctCount / totalAttempts` (0–1 en API) |
| Envelope | `{ data: SubcategoryProgressDto[] }` |

## SubcategoryProgressDto

| Campo | Tipo |
|-------|------|
| `category` | string |
| `subcategory` | string |
| `totalAttempts` | number |
| `correctCount` | number |
| `accuracy` | number (0–1) |
