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

## Referencias

- [Taxonomía de contenido](../../../domain/content-taxonomy.md)
- [Spec de Content](../../../spec/content.md)
