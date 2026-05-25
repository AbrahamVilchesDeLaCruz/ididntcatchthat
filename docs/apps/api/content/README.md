# Content BC — Documentación

> Bounded Context responsable del catálogo de flashcards y el pipeline de generación de audio en ididntcatchthat.

## Flujos de negocio

Cada flujo tiene 3 diagramas: secuencia, clases y casos de uso.

| Flujo                                   | Descripción                                    | Diagramas                                                                                                                              |
| --------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Create](./create/)                     | Crear flashcard individual (formulario)        | [Secuencia](./create/sequence.md) · [Clases](./create/classes.md) · [Casos de uso](./create/usecases.md)                               |
| [Bulk Create](./bulk-create/)           | Crear múltiples flashcards en un solo request  | [Secuencia](./bulk-create/sequence.md) · [Clases](./bulk-create/classes.md) · [Casos de uso](./bulk-create/usecases.md)                |
| [Import PDF](./import-pdf/)             | Extraer flashcards desde PDF con IA            | [Secuencia](./import-pdf/sequence.md) · [Clases](./import-pdf/classes.md) · [Casos de uso](./import-pdf/usecases.md)                   |
| [Update](./update/)                     | Editar flashcard existente                     | [Secuencia](./update/sequence.md) · [Clases](./update/classes.md) · [Casos de uso](./update/usecases.md)                               |
| [Search](./search/)                     | Listar y filtrar flashcards                    | [Secuencia](./search/sequence.md) · [Clases](./search/classes.md) · [Casos de uso](./search/usecases.md)                               |
| [Suggest Examples](./suggest-examples/) | Generar ejemplos de uso con IA                 | [Secuencia](./suggest-examples/sequence.md) · [Clases](./suggest-examples/classes.md) · [Casos de uso](./suggest-examples/usecases.md) |
| [Audio Pipeline](./audio-pipeline/)     | Generación asíncrona de audio post-publicación | [Secuencia](./audio-pipeline/sequence.md) · [Clases](./audio-pipeline/classes.md) · [Casos de uso](./audio-pipeline/usecases.md)       |

---

## Mapa de endpoints

| Método | Ruta                     | Flujo                                   | Auth                   |
| ------ | ------------------------ | --------------------------------------- | ---------------------- |
| `POST` | `/flashcards`            | [Create](./create/)                     | Bearer (teacher/admin) |
| `POST` | `/flashcards/bulk`       | [Bulk Create](./bulk-create/)           | Bearer (teacher/admin) |
| `POST` | `/flashcards/import/pdf` | [Import PDF](./import-pdf/)             | Bearer (teacher/admin) |
| `PUT`  | `/flashcards/:id`        | [Update](./update/)                     | Bearer (teacher/admin) |
| `GET`  | `/flashcards/:id`        | [Search](./search/)                     | Bearer (any)           |
| `GET`  | `/flashcards`            | [Search](./search/)                     | Bearer (any)           |
| `POST` | `/ai/suggest-examples`   | [Suggest Examples](./suggest-examples/) | Bearer (teacher/admin) |

---

## Arquitectura general

```mermaid
graph LR
    subgraph Infrastructure
        C[Controllers]
        E[TypeORM Entities]
        R[TypeOrmFlashcardRepository]
        AI_EX[DeepseekAiExampleGenerator]
        AI_PDF[DeepseekPdfFlashcardExtractor]
        EL[ElevenLabsAudioGenerator]
        CDN[CloudflareAudioCdnUploader]
    end

    subgraph Application
        UC[Use Cases]
        AH[AudioGenerationHandler]
    end

    subgraph Domain
        F[Flashcard Aggregate]
        EX[Example Entity]
        RI[FlashcardRepository interface]
        AEG[AiExampleGenerator interface]
        PFE[PdfFlashcardExtractor interface]
        AG[AudioGenerator interface]
        ACU[AudioCdnUploader interface]
        EV[Domain Events]
        ERR[Domain Exceptions]
    end

    C --> UC
    UC --> F
    UC --> RI
    UC --> AEG
    UC --> PFE
    AH --> AG
    AH --> ACU
    AH --> RI
    F --> EV
    F --> ERR
    R -.implements.-> RI
    AI_EX -.implements.-> AEG
    AI_PDF -.implements.-> PFE
    EL -.implements.-> AG
    CDN -.implements.-> ACU
```

---

## Domain Events publicados al bus

| Evento                  | Exchange                         | Consumer                                                               |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `FlashcardCreatedEvent` | `idct.content.flashcard.created` | `AudioGenerationHandler` (interno)                                     |
| `FlashcardUpdatedEvent` | `idct.content.flashcard.updated` | `AudioGenerationHandler` (interno, solo si cambia expression/examples) |

> Ambos eventos son **auto-consumidos** por el propio BC Content. Ningún otro BC los consume directamente.

---

## Referencias

- [Spec de Content](../../../spec/content.md)
- [Tasks](../../../tasks/content.md)
- [Domain Model](../../../domain/domain-model.md)
- [Content & Backoffice](../../../domain/content-backoffice.md)
