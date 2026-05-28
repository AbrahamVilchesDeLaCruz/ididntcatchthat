# Import PDF — Casos de Uso

```mermaid
---
title: Import PDF Flashcards — Casos de uso
---
graph TB
    Teacher(["👨‍🏫 Teacher"])
    Admin(["🛡️ Admin"])

    UC1["Subir PDF y obtener drafts"]
    UC2["Confirmar importación (bulk create)"]
    E1["Error: no se extraen flashcards"]

    Teacher --> UC1
    Admin --> UC1
    UC1 -->|"<<include>>"| UC2
    UC1 -.->|"<<extend>>"| E1
```

## Reglas de negocio

| Regla                                                        | Acción                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `PdfFlashcardImporter` NO persiste — solo extrae             | La persistencia ocurre en el flujo Bulk Create                           |
| El LLM puede no extraer flashcards útiles                    | `PdfExtractionFailed` (422)                                              |
| Los drafts son editables en el frontend                      | El teacher revisa antes de confirmar                                     |
| El system prompt estructura la respuesta del LLM             | JSON con campos `expression, meaning, category, subcategory, examples[]` |
| `ipaNotation` y `nativeSpeech` pueden ser null en los drafts | El teacher puede completarlos manualmente                                |
