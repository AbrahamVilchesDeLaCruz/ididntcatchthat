# Tasks: Content — Bounded Context Content (Backoffice)

**Spec**: [docs/spec/content.md](../spec/content.md)  
**Tasks**: este archivo (`docs/tasks/content.md`)  
**Rama de implementación**: `feat/content-spec`  
**Orden**: secuencial — cada bloque depende del anterior

> **TDD obligatorio**: cada tarea de Application Layer tiene su test `.spec.ts` escrito PRIMERO (Red → Green → Refactor). Los tests E2E son el criterio de aceptación final de cada flujo.

---

## Bloque 1 — Domain

> TypeScript puro. Sin NestJS, sin TypeORM. Todo testeable sin I/O.

- [ ] **TASK-CONTENT-01** — Value Object `FlashcardId`
  - Extiende `StringValueObject`. UUID v4 válido. Método `FlashcardId.generate()`.
  - **Test (RED primero)**: válido, inválido lanza error.
  - Mother: `FlashcardIdMother.random()`, `FlashcardIdMother.create(value)`.

- [ ] **TASK-CONTENT-02** — Value Objects `Expression` y `Meaning`
  - `Expression`: non-empty, max 200 chars.
  - `Meaning`: non-empty, max 500 chars.
  - **Test (RED primero)**: válidos, vacíos lanzan error, exceso de longitud lanza error.

- [ ] **TASK-CONTENT-03** — Value Object `Category`
  - Enum: `native_sounds | connecting_words | beautifying_sentences | sounding_native`.
  - Factory `create(value: string)` con validación.
  - **Test (RED primero)**: valores válidos e inválidos.

- [ ] **TASK-CONTENT-04** — Value Object `Subcategory` (con validación cruzada)
  - Enum cerrado por categoría (ver spec).
  - Factory `create(value: string, category: Category)` — lanza `InvalidSubcategory` si la combinación no es válida.
  - **Test (RED primero)**: combinaciones válidas, subcategoría inválida para la categoría, subcategoría de otra categoría.

- [ ] **TASK-CONTENT-05** — Value Objects `IpaNotation`, `NativeSpeech`, `AudioStatus`, `AudioUrls`
  - `IpaNotation`: string nullable (puede ser null si IA no lo generó aún).
  - `NativeSpeech`: string nullable.
  - `AudioStatus`: enum `pending | generating | ready | failed`.
  - `AudioUrls`: VO compuesto con estructura `{ expression: { us, uk, au }, examples: { us } }`. Validar que todos los campos son URLs non-empty.
  - **Test**: `AudioStatus` válidos e inválidos. `AudioUrls` con estructura completa e incompleta.

- [ ] **TASK-CONTENT-06** — Domain Exceptions
  - `FlashcardNotFound`, `FlashcardAccessDenied`, `InvalidSubcategory`, `InvalidExampleCount`, `PdfExtractionFailed`.
  - Todos extienden `DomainError` de shared.
  - Archivo: `content/domain/exceptions/<name>.ts`.

- [ ] **TASK-CONTENT-07** — Domain Events
  - `FlashcardCreatedEvent` — `ididntcatchthat.content.flashcard.created`.
    - Atributos: `flashcardId`, `expression`, `category`, `subcategory`, `examples[]`, `createdBy`.
  - `FlashcardUpdatedEvent` — `ididntcatchthat.content.flashcard.updated`.
    - Atributos: `flashcardId`, `changedFields: string[]`, `expression?`, `examples[]?`.
  - Archivo: `content/domain/events/<name>.event.ts`.

- [ ] **TASK-CONTENT-08** — Entidad `Example`
  - Campos: `id`, `flashcardId`, `textEn`, `textEs`, `position` (1|2|3).
  - Factory estática `Example.create(flashcardId, textEn, textEs, position): Example`.
  - `toPrimitives()` / `fromPrimitives()`.
  - **Test (RED primero)**: `create` genera id, posición inválida lanza error.
  - Mother: `ExampleMother.random(flashcardId, position)`.

- [ ] **TASK-CONTENT-09** — Aggregate `Flashcard`
  - Campos y métodos completos según spec.
  - `Flashcard.create(...)` → crea instancia con `audioStatus: pending`.
  - `flashcard.update(fields)` → llama `record(FlashcardUpdatedEvent)` SOLO si cambia `expression` o `examples`.
  - `flashcard.markAudioGenerating()`, `markAudioReady(urls)`, `markAudioFailed()`.
  - `fromPrimitives()` / `toPrimitives()`.
  - **Test (RED primero)**:
    - `create` produce `audioStatus: pending`, no emite evento.
    - `update` con `expression` distinta → emite `FlashcardUpdatedEvent`.
    - `update` con solo `meaning` distinto → NO emite evento.
    - `markAudioReady` cambia status a `ready`.
    - `markAudioFailed` cambia status a `failed`.
    - Más de 3 ejemplos → `InvalidExampleCount`.
    - 0 ejemplos → `InvalidExampleCount`.
    - `fromPrimitives` no emite eventos.
  - Mother: `FlashcardMother.random(overrides?)`, `FlashcardMother.withAudioReady()`, `FlashcardMother.withAudioPending()`.

- [ ] **TASK-CONTENT-10** — Interfaces de repositorio y puertos
  - `FlashcardRepository` + `FLASHCARD_REPOSITORY` en `content/domain/flashcard.repository.ts`.
  - `AiExampleGenerator` + `AI_EXAMPLE_GENERATOR` en `content/domain/ai-example-generator.ts`.
  - `PdfFlashcardExtractor` + `PDF_FLASHCARD_EXTRACTOR` en `content/domain/pdf-flashcard-extractor.ts`.

---

## Bloque 2 — Application (Use Cases)

> Reciben primitivos. Usan repositorios via interface. Mockeados con `jest-mock-extended`.  
> **Test PRIMERO en cada use case** — escribir el `.spec.ts` antes de la implementación.

- [ ] **TASK-CONTENT-11** — `FlashcardCreator`
  - **Test (RED primero)**:
    - Creación exitosa → flashcard persistida, evento publicado, retorna primitives.
    - `expression` vacía → `Expression` lanza error.
    - Subcategoría inválida para categoría → `InvalidSubcategory`.
    - Más de 3 ejemplos → `InvalidExampleCount`.
  - Mother: `RequestFlashcardCreatorMother.random()`, `RequestFlashcardCreatorMother.withExamples(n)`.

- [ ] **TASK-CONTENT-12** — `FlashcardBulkCreator`
  - **Test (RED primero)**:
    - Bulk con N ítems válidos → N flashcards persistidas, N eventos publicados.
    - Un ítem inválido → error, ninguna se persiste (o decidir si es best-effort — definir en impl.).
    - Array vacío → error o resultado vacío.
  - Mother: `RequestFlashcardBulkCreatorMother.random(count)`.

- [ ] **TASK-CONTENT-13** — `PdfFlashcardImporter`
  - **Test (RED primero)**:
    - Extracción exitosa → retorna drafts sin persistir.
    - `PdfFlashcardExtractor` lanza error → `PdfExtractionFailed`.
    - Mock de `PdfFlashcardExtractor` devuelve drafts → use case los retorna intactos.

- [ ] **TASK-CONTENT-14** — `FlashcardUpdater`
  - **Test (RED primero)**:
    - Actualización exitosa → flashcard actualizada, retorna primitives.
    - Cambio de `expression` → emite `FlashcardUpdatedEvent`.
    - Cambio de `meaning` → NO emite evento.
    - Cambio de `examples` → emite `FlashcardUpdatedEvent`.
    - Flashcard inexistente → `FlashcardNotFound`.
    - Teacher que no es el creador → `FlashcardAccessDenied`.
    - Admin (rol) puede editar cualquier flashcard.
  - Mother: `RequestFlashcardUpdaterMother.random(id)`.

- [ ] **TASK-CONTENT-15** — `FlashcardFinder`
  - **Test (RED primero)**:
    - Flashcard encontrada → retorna primitives.
    - Flashcard inexistente → `FlashcardNotFound`.

- [ ] **TASK-CONTENT-16** — `FlashcardSearcher`
  - **Test (RED primero)**:
    - Sin filtros → retorna todas con paginación.
    - Filtro por `category` → solo las de esa categoría.
    - `page` y `pageSize` se aplican correctamente.
    - Retorna `{ data, total, page, pageSize }`.

- [ ] **TASK-CONTENT-17** — `AiExampleSuggester`
  - **Test (RED primero)**:
    - Retorna drafts del generador IA — no persiste.
    - `AiExampleGenerator` falla → error propagado.

- [ ] **TASK-CONTENT-17B** — `CatalogQuerier`
  - Serializa `CATEGORIES_CATALOG` (map estático de enums) en runtime.
  - Sin repositorio, sin inyección de dependencias, sin DB.
  - **Test (RED primero)**:
    - `run()` retorna las 4 categorías con sus subcategorías y labels.
    - Cada entry tiene `value` (snake_case) y `subcategories[]` con `value` + `label`.
    - El total de subcategorías coincide con el total de entradas de los 4 enums.

- [ ] **TASK-CONTENT-18** — `AudioGenerationHandler` (Application Handler)
  - Escucha `FlashcardCreatedEvent` y `FlashcardUpdatedEvent`.
  - Llama `ElevenLabsAudioGenerator` (puerto) → sube a CDN → `markAudioReady`.
  - En error → `markAudioFailed`.
  - **Test (RED primero)**:
    - Handler recibe evento → llama generador, actualiza status a `ready`.
    - Error en generador → status `failed`.
    - `FlashcardUpdatedEvent` sin `expression`/`examples` en `changedFields` → handler NO actúa.
  - Interfaces de dominio nuevas: `AudioGenerator` + `AUDIO_GENERATOR`, `AudioCdnUploader` + `AUDIO_CDN_UPLOADER`.

---

## Bloque 3 — Infrastructure

> NestJS, TypeORM. Cubiertos principalmente por tests E2E.

- [ ] **TASK-CONTENT-19** — Migración TypeORM `create-content`
  - Crea tablas `flashcards` y `flashcard_examples` con índices y constraints del spec.
  - Constraints: `position BETWEEN 1 AND 3`, FK `flashcard_id`, índice en `(category, subcategory)`, `audio_status`.
  - Siguiendo el skill `api-migrations`.

- [ ] **TASK-CONTENT-20** — Entidades TypeORM
  - `FlashcardEntity` — mapea tabla `flashcards`. `audioUrls` como `jsonb`.
  - `ExampleEntity` — mapea tabla `flashcard_examples`.
  - Solo mapeo. Sin lógica. Sufijo `Entity`.

- [ ] **TASK-CONTENT-21** — `TypeOrmFlashcardRepository`
  - Implementa `FlashcardRepository`.
  - `save()`: upsert flashcard + upsert/delete/insert examples (sincronización de array).
  - `search(id)`: join con examples.
  - `match(criteria)`: usa `CriteriaConverter`, filtra por `category`, `subcategory`, `audioStatus`, paginación.
  - `count(criteria)`: COUNT(\*) con los mismos filtros.

- [ ] **TASK-CONTENT-22** — `DeepseekAiExampleGenerator`
  - Implementa `AiExampleGenerator`.
  - Llama a DeepSeek API con prompt estructurado: expression + category → 1-3 ejemplos.
  - Parsea respuesta JSON del LLM.
  - En `content/infrastructure/ai/`.

- [ ] **TASK-CONTENT-23** — `DeepseekPdfFlashcardExtractor`
  - Implementa `PdfFlashcardExtractor`.
  - Extrae texto del PDF (con `pdf-parse` o similar).
  - Envía a DeepSeek con system prompt estructurado.
  - Parsea y retorna `FlashcardDraft[]`.

- [ ] **TASK-CONTENT-24** — `ElevenLabsAudioGenerator` y `CloudflareAudioCdnUploader`
  - `ElevenLabsAudioGenerator` implementa `AudioGenerator` → llama a ElevenLabs API por voz.
  - `CloudflareAudioCdnUploader` implementa `AudioCdnUploader` → sube buffer a Cloudflare R2.
  - En `content/infrastructure/audio/`.

- [ ] **TASK-CONTENT-25** — Payloads con `class-validator`
  - `CreateFlashcardPostPayload`: todos los campos obligatorios + `examples[]` con nested validation.
  - `BulkCreateFlashcardsPostPayload`: `flashcards[]` con nested `CreateFlashcardPostPayload`.
  - `UpdateFlashcardPutPayload`: todos los campos opcionales (partial), `examples[]` opcional.
  - `SearchFlashcardsGetQuery`: `category?`, `subcategory?`, `audioStatus?`, `page?`, `pageSize?`.
  - `SuggestExamplesPostPayload`: `expression`, `category`.
  - `GetCategoriesGetController` → `GET /catalogs/categories` — 200, `@Public()`, sin guard.

- [ ] **TASK-CONTENT-26** — Controllers
  - `CreateFlashcardPostController` → `POST /flashcards` — 201.
  - `BulkCreateFlashcardsPostController` → `POST /flashcards/bulk` — 201 con `{ created: N }`.
  - `ImportPdfFlashcardsPostController` → `POST /flashcards/import/pdf` — 200 con drafts.
  - `UpdateFlashcardPutController` → `PUT /flashcards/:id` — 200.
  - `FindFlashcardGetController` → `GET /flashcards/:id` — 200.
  - `SearchFlashcardsGetController` → `GET /flashcards` — 200 paginado.
  - `SuggestExamplesPostController` → `POST /ai/suggest-examples` — 200.
  - `GetCategoriesGetController` → `GET /catalogs/categories` — 200, `@Public()`.

- [ ] **TASK-CONTENT-27** — Registro de excepciones en `ContentModule`
  - Registrar todos los `DomainError` del BC Content en `GlobalExceptionRegistry`.
  - Siguiendo el skill `api-error-handler`.

- [ ] **TASK-CONTENT-28** — `ContentModule` NestJS
  - Declara providers con tokens Symbol.
  - Registra `AudioGenerationHandler` como listener de eventos.
  - Importa `SharedModule`.
  - Registra controllers.
  - Siguiendo skill `api-di`.

---

## Bloque 4 — Tests E2E

> Tests de integración completos. Corren contra DB real + mocks de ElevenLabs y DeepSeek.

- [ ] **TASK-CONTENT-29** — E2E: Crear flashcard (`create-flashcard.e2e-spec.ts`)
  - Creación válida → 201 con flashcard.
  - Sin token → 401.
  - Con token `user` → 403.
  - Con token `teacher` → 201.
  - Subcategoría inválida → 422.

- [ ] **TASK-CONTENT-30** — E2E: Bulk create (`bulk-create-flashcards.e2e-spec.ts`)
  - Bulk válido → 201 con `{ created: N }`.
  - Un ítem inválido → 422, ninguna persistida.

- [ ] **TASK-CONTENT-31** — E2E: Editar flashcard (`update-flashcard.e2e-spec.ts`)
  - Edición válida → 200.
  - Flashcard de otro teacher → 403.
  - Admin edita flashcard de cualquier teacher → 200.

- [ ] **TASK-CONTENT-32** — E2E: Buscar y filtrar (`search-flashcards.e2e-spec.ts`)
  - Sin filtros → lista paginada.
  - Filtro por `category` → solo esa categoría.
  - Usuario `user` no ve flashcards `pending`.

- [ ] **TASK-CONTENT-33** — E2E: Sugerir ejemplos (`suggest-examples.e2e-spec.ts`)
  - Retorna ejemplos sin persistir.
  - Con mock de DeepSeek (no llama real en tests).

- [ ] **TASK-CONTENT-33B** — E2E: Catálogo de categorías (`get-categories.e2e-spec.ts`)
  - `GET /catalogs/categories` sin token → 200.
  - Respuesta contiene las 4 categorías con sus subcategorías.
  - Sin mock de DB — no toca persistencia.

---

## Bloque 5 — Documentación

- [ ] **TASK-CONTENT-34** — Diagramas por feature en `docs/apps/api/content/`
  - README con índice de flujos.
  - Por cada flujo (`create/`, `bulk-create/`, `import-pdf/`, `update/`, `search/`, `suggest-examples/`, `audio-pipeline/`, `catalogs/`):
    - `sequence.md` — diagrama de secuencia Mermaid.
    - `classes.md` — diagrama de clases Mermaid.
    - `usecases.md` — diagrama de casos de uso Mermaid.
