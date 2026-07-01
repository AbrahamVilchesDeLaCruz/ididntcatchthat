# Content BC

## Submódulos DDD

```
content/
├── flashcard/          ← agregado Flashcard + pipeline AI/audio
└── shared/
    └── infrastructure/framework/   ← ContentModule + exception registry
```

Taxonomía compartida cross-BC (slugs + validación): `@/shared/domain/subcategory-taxonomy.ts`  
Metadatos i18n del catálogo (solo Content): `flashcard/domain/subcategory-catalog.ts`

## Endpoints

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| `POST` | `/flashcards` | admin | 201 void |
| `POST` | `/flashcards/bulk` | admin | 201 void |
| `PATCH` | `/flashcards/:id` | admin | 204 void |
| `GET` | `/flashcards/:id` | admin | envelope |
| `GET` | `/flashcards` | admin | paginated envelope |
| `GET` | `/flashcards/catalog` | público | envelope |
| `POST` | `/flashcards/drafts` | admin | envelope (AI) |
| `POST` | `/flashcards/example-suggestions` | admin | envelope (AI) |

## Eventos publicados

| Evento | Exchange | Cuándo |
|--------|----------|--------|
| `FlashcardCreated` | `ididntcatchthat.content.flashcard.created` | Alta de flashcard |
| `FlashcardExpressionUpdated` | `ididntcatchthat.content.flashcard.expression_updated` | PATCH expression |
| `FlashcardExamplesUpdated` | `ididntcatchthat.content.flashcard.examples_updated` | PATCH examples |
| `FlashcardMeaningUpdated` | `ididntcatchthat.content.flashcard.meaning_updated` | PATCH meaning |
| `FlashcardExamplesCompleted` | `ididntcatchthat.content.flashcard.examples_completed` | AI completa ejemplos |
| `FlashcardPhoneticsCompleted` | `ididntcatchthat.content.flashcard.phonetics_completed` | AI completa fonética |
| `FlashcardAudioGenerating/Ready/Failed` | `ididntcatchthat.content.flashcard.audio_*` | Pipeline de audio |

## Eventos consumidos (internos)

| Evento | Subscriber | Efecto |
|--------|------------|--------|
| `FlashcardCreated` | `EnrichFlashcardOnFlashcardCreated` | AI examples → AI phonetics (secuencial) |
| `FlashcardExamplesCompleted` | `GenerateFlashcardAudioOnFlashcardExamplesCompleted` | Genera y sube audio (create) |
| `FlashcardExpressionUpdated` | `GenerateFlashcardAudioOnFlashcardExpressionUpdated` | Regenera audio (update) |
| `FlashcardExamplesUpdated` | `GenerateFlashcardAudioOnFlashcardExamplesUpdated` | Regenera audio (update) |

### Pipeline async

```
FlashcardCreated
  └─► EnrichFlashcardOnFlashcardCreated
        ├─► AiExamplesCompleter → FlashcardExamplesCompleted
        └─► AiPhoneticsCompleter → FlashcardPhoneticsCompleted
FlashcardExamplesCompleted → FlashcardAudioGenerator → AudioGenerating/Ready/Failed
FlashcardExpressionUpdated | FlashcardExamplesUpdated → FlashcardAudioGenerator
```

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `flashcards` | Agregado Flashcard (JSONB examples, audio_urls) |

## Paridad

- Taxonomía ↔ metadatos: `subcategory-taxonomy-parity.spec.ts`
- Taxonomía publicada en `@/shared/domain/subcategory-taxonomy.ts` — Gaming valida scope sin importar Content

## Flujos detallados

| Flujo | Descripción | Diagramas |
|-------|-------------|-----------|
| [Create](./create/) | `POST /flashcards` | [Clases](./create/classes.md) · [Secuencia](./create/sequence.md) · [Casos de uso](./create/usecases.md) |
| [Bulk Create](./bulk-create/) | `POST /flashcards/bulk` | [Clases](./bulk-create/classes.md) · [Secuencia](./bulk-create/sequence.md) · [Casos de uso](./bulk-create/usecases.md) |
| [Update](./update/) | `PATCH /flashcards/:id` | [Clases](./update/classes.md) · [Secuencia](./update/sequence.md) · [Casos de uso](./update/usecases.md) |
| [Search](./search/) | `GET /flashcards`, `GET /flashcards/:id` | [Clases](./search/classes.md) · [Secuencia](./search/sequence.md) · [Casos de uso](./search/usecases.md) |
| [Catalogs](./catalogs/) | `GET /flashcards/catalog` | [Clases](./catalogs/classes.md) · [Secuencia](./catalogs/sequence.md) · [Casos de uso](./catalogs/usecases.md) |
| [Generate Flashcards](./generate-flashcards/) | `POST /flashcards/drafts` | [Clases](./generate-flashcards/classes.md) · [Secuencia](./generate-flashcards/sequence.md) · [Casos de uso](./generate-flashcards/usecases.md) |
| [Suggest Examples](./suggest-examples/) | `POST /flashcards/example-suggestions` | [Clases](./suggest-examples/classes.md) · [Secuencia](./suggest-examples/sequence.md) · [Casos de uso](./suggest-examples/usecases.md) |
| [Audio Pipeline](./audio-pipeline/) | Subscribers AMQP (enrich + audio) | [Clases](./audio-pipeline/classes.md) · [Secuencia](./audio-pipeline/sequence.md) · [Casos de uso](./audio-pipeline/usecases.md) |

## Referencias

- [Taxonomía de contenido](../../../domain/content-taxonomy.md)
- [Spec de Content](../../../spec/content.md)
