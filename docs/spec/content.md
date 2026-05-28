# Spec: Content — Bounded Context Content

**Estado**: Borrador  
**Fecha**: 2026-05-25  
**BC**: Content  
**Scope**: API (`apps/api/src/content/`)  
**Tasks**: [docs/tasks/content.md](../tasks/content.md)

> **Relación con BC Game**: Content es el dueño del ciclo de vida del aggregate `Flashcard` (write side). Game lo consume como read model. Son BCs distintos — Game nunca crea ni modifica Flashcards.

---

## Casos de uso por actor

| Actor           | Caso de uso                          | Endpoint                            |
| --------------- | ------------------------------------ | ----------------------------------- |
| Teacher / Admin | Crear flashcard (formulario)         | `POST /flashcards`                  |
| Teacher / Admin | Crear flashcards en bulk (JSON)      | `POST /flashcards/bulk`             |
| Teacher / Admin | Importar flashcards desde PDF (IA)   | `POST /flashcards/import/pdf`       |
| Teacher / Admin | Editar flashcard                     | `PUT /flashcards/:id`               |
| Teacher / Admin | Obtener flashcard por id             | `GET /flashcards/:id`               |
| Teacher / Admin | Listar flashcards con filtros        | `GET /flashcards`                   |
| Teacher / Admin | Sugerir ejemplos con IA              | `POST /ai/suggest-examples`         |
| User / Guest    | Listar flashcards (catálogo público) | `GET /flashcards` (filtros básicos) |
| User / Guest    | Obtener flashcard por id             | `GET /flashcards/:id`               |
| Any             | Obtener catálogo de categorías       | `GET /catalogs/categories`          |

> El teacher/admin puede filtrar por `category`, `subcategory`, `audio_status`.  
> El usuario solo ve flashcards con `audio_status: ready` (filtro aplicado en query).  
> `GET /catalogs/categories` no requiere autenticación — es público y no toca DB.

---

## Modelo de clases

### Jerarquía de Value Objects

```
StringValueObject (shared)
  ├── FlashcardId      — UUID v4, generate()
  ├── Expression       — non-empty, max 200 chars
  ├── Meaning          — non-empty, max 500 chars
  ├── Category         — enum: mastering_sounds | connecting_words_in_speech | beautifying_sentences | sounding_native
  ├── Subcategory      — enum cerrado por categoría (ver tabla más abajo)
  ├── IpaNotation      — string non-empty (el campo en Aggregate es IpaNotation | null)
  ├── NativeSpeech     — string non-empty (el campo en Aggregate es NativeSpeech | null)
  └── AudioStatus      — enum: pending | generating | ready | failed
```

### Subcategorías por categoría

Las subcategorías son enums cerrados validados en el VO `Subcategory.create(value, category)`.  
Si la combinación es inválida, lanza `InvalidSubcategory`.

#### `mastering_sounds` (category: `MasteringSounds`)

| Valor enum              | Label                               |
| ----------------------- | ----------------------------------- |
| `FLAP_T_PARTY_CITY`     | Flap T (party, city...)             |
| `STOP_T`                | Stop T                              |
| `THE_T_SOUND`           | The T sound                         |
| `THE_B_SOUND`           | The B sound                         |
| `THE_CH_SOUND`          | The Ch sound                        |
| `THE_H_SOUND`           | The H Sound                         |
| `THE_K_SOUND`           | The K Sound                         |
| `THE_N_SOUND`           | The N Sound                         |
| `THE_P_SOUND`           | The P Sound                         |
| `THE_R_SOUND`           | The R sound                         |
| `THE_SH_SOUND`          | The SH Sound                        |
| `THE_SCHWA_SOUND`       | The Schwa sound                     |
| `THE_U_SOUND`           | The U sound                         |
| `THE_V_SOUND`           | The V Sound                         |
| `THE_W_SOUND`           | The W sound                         |
| `THE_Z_SOUND`           | The Z Sound                         |
| `THE_A_SOUND_PART1`     | The a sound - Part 1                |
| `THE_ZH_SOUND`          | The zh sound (measure, confusion)   |
| `THE_D_SOUND`           | The D sound                         |
| `THE_J_SOUND`           | The J sound                         |
| `THE_L_SOUND`           | The L Sound                         |
| `THE_S_SOUND`           | The S sound                         |
| `THE_F_SOUND`           | The F sound                         |
| `THE_M_SOUND`           | The M sound                         |
| `THE_E_AS_IN_BED`       | The E as in Bed                     |
| `SOUND_A_AS_IN_CAKE`    | The sound A as in Cake              |
| `SOUND_E_AS_IN_HE`      | The sound E as in HE                |
| `SOUND_G_AS_IN_EGG`     | The sound G as in Egg               |
| `SOUND_NG_AS_IN_LONG`   | The sound NG as in Long             |
| `SOUND_O_AS_IN_OPEN`    | The sound O as in Open              |
| `SOUND_O_AS_IN_GOT`     | The sound O as in got               |
| `SOUND_OU_AS_IN_OUT`    | The sound OU as in out              |
| `SOUND_OI_AS_IN_BOY`    | The sound Oi as in Boy              |
| `SOUND_TH_AS_IN_THAT`   | The sound Th as in That             |
| `SOUND_TH_AS_IN_THINK`  | The sound Th as in Think            |
| `SOUND_U_AS_IN_CUT`     | The sound U as in Cut               |
| `SOUND_U_AS_IN_LOOK`    | The sound U as in Look              |
| `SOUND_U_AS_IN_FOOD`    | The sound U as in Food              |
| `SOUND_UR_AS_IN_CURE`   | The sound Ur as in Cure             |
| `SOUND_X_AS_IN_EXACT`   | The sound X as in Exact             |
| `SOUND_X_AS_IN_EXPLAIN` | The sound X as in Explain           |
| `SOUND_Y_AS_IN_YES`     | The sound Y as in Yes               |
| `SOUND_I_AS_IN_ICE`     | The sound i as in ice               |
| `SOUND_I_AS_IN_IT`      | The sound i as in it                |
| `SOUND_AR_AS_IN_CAR`    | The Sound AR as in Car              |
| `SOUND_AW_AS_IN_LAW`    | The Sound AW as in law              |
| `SOUND_ER_AS_IN_BIRD`   | The Sound ER as in Bird             |
| `SOUND_ER_AS_IN_AIR`    | The sound ER as in Air, Bear, Chair |
| `SOUND_EER_AS_IN_HEAR`  | The sound Eer as in Hear            |
| `BONUS`                 | Bonus                               |
| `BONUS_DIDJU`           | Bonus Didju                         |
| `BONUS_KISS_THE_KEYS`   | Bonus: Kiss the keys                |
| `BONUS_MASTERING_2_THS` | Bonus: Mastering the 2 THs          |
| `BONUS_CH_SOUND`        | Bonus: The CH sound                 |
| `BONUS_R`               | Bonus: The R                        |
| `BONUS_SH`              | Bonus: The SH                       |
| `BONUS_V_AND_B`         | Bonus: The V and the B              |
| `BONUS_A_AND_U`         | Bonus: The a and the u              |
| `BONUS_L_AND_R`         | Bonus: The L and the R              |
| `BONUS_S_AND_Z`         | Bonus: The S and the Z              |

#### `connecting_words_in_speech` (category: `ConnectingWordsInSpeech`)

| Valor enum          | Label                             |
| ------------------- | --------------------------------- |
| `FLAP_T_THAT_APPLE` | Flap T (that apple)               |
| `WANNA_AND_GONNA`   | Wanna and Gonna                   |
| `BONUS_WANNA_GONNA` | Bonus wanna and gonna             |
| `KINDA_SORTA`       | Kinda / Sorta (Kind of / Sort of) |
| `NEEDA_HAFTA_GIMME` | needa, hafta, gimme               |
| `COULDA_SHOULDA`    | Coulda, shoulda...                |
| `DIDJU_COULDJU`     | Didju, Couldju...                 |
| `DONCHU_DONCHA`     | Donchu/Doncha (Don't you)         |
| `USING_THE_SCHWA`   | Using the Schwa sound             |
| `D_AND_T_DISAPPEAR` | When the D and T disappear        |
| `OUTTA`             | Outta                             |
| `GOWOUT`            | Gowout (Go out)                   |
| `TELL_IM_TELL_ER`   | Tell_im – Tell_er                 |
| `STRONG_GUY`        | Strong_guy                        |

#### `beautifying_sentences` (category: `BeautifyingSentences`)

| Valor enum                           | Label                                   |
| ------------------------------------ | --------------------------------------- |
| `CONTRAST`                           | Contrast                                |
| `ADDITION_1`                         | Addition 1                              |
| `ADDITION_1_FURTHERMORE`             | Addition 1 (Furthermore)                |
| `ADDITION_2`                         | Addition 2                              |
| `EMPHASIS_1`                         | Emphasis 1                              |
| `EMPHASIS_2`                         | Emphasis 2                              |
| `EXCEPTIONS_AND_CONDITIONS`          | Exceptions and Conditions               |
| `EXPLAINING_REPHRASING_GAINING_TIME` | Explaining, rephrasing and gaining time |
| `GIVING_EXAMPLES`                    | Giving examples                         |
| `GIVING_AN_EXAMPLE`                  | Giving an example                       |
| `MEETINGS`                           | Meetings                                |
| `PRESENTATIONS`                      | Presentations                           |
| `REASON_PURPOSE_AND_RESULT`          | Reason, purpose and result              |
| `SUMMARY`                            | Summary                                 |
| `TIME_AND_SEQUENCE`                  | Time and sequence                       |

#### `sounding_native` (category: `SoundingNative`)

| Valor enum                   | Label                                           |
| ---------------------------- | ----------------------------------------------- |
| `DEAL_AND_OTHER_EXPRESSIONS` | Deal & other expressions                        |
| `FIGURE_OUT_PRETTY`          | Figure out, Pretty...                           |
| `STUFF_AND_YOU_GUYS`         | Stuff & You guys                                |
| `AINT_CUZ_POINT`             | Ain't / Cuz / Point                             |
| `BIG_TIME_HANG_OUT`          | Big time, hang out...                           |
| `GOTTA_DAMN_MAKE_IT`         | Gotta, Damn, Make it                            |
| `GRAB_APPRECIATE`            | Grab, appreciate...                             |
| `I_MEAN_MIGHT_AS_WELL`       | I mean, might as well, long story short...      |
| `PITCH_IN_HIT_THE_SACK`      | Pitch in, hit the sack...                       |
| `REGULAR_VERBS_PART1`        | Regular Verbs Pronunciation Part 1 (T / id)     |
| `REGULAR_VERBS_PART2`        | Regular Verbs Pronunciation Part 2 (D – Voiced) |
| `UHM_SO_I_MEAN`              | Uhm, So, I mean...                              |

> **Regla de validación**: `Subcategory.create(value, category)` verifica que `value` pertenezca  
> al enum correspondiente a `category`. Si no, lanza `InvalidSubcategory`.  
> Los valores del enum se almacenan en DB como strings (e.g. `"FLAP_T_PARTY_CITY"`).  
> Los labels son solo para presentación — no se persisten.

### Entidad `Example`

```
Example (Entity — sin AggregateRoot)
  ├── id: string
  ├── flashcardId: string
  ├── textEn: string        — non-empty
  ├── textEs: string        — non-empty
  └── position: number      — 1 | 2 | 3

  + create(flashcardId, textEn, textEs, position): Example  [static]
  + fromPrimitives(p): Example                              [static]
  + toPrimitives(): ExamplePrimitives
```

### Aggregate `Flashcard`

```
Flashcard extends AggregateRoot<FlashcardPrimitives>
  ├── id: FlashcardId                          (public readonly)
  ├── expression: Expression                   (public)
  ├── meaning: Meaning                         (public)
  ├── category: Category                       (public)
  ├── subcategory: Subcategory                 (public)
  ├── ipaNotation: IpaNotation | null          (public) — null = no generado todavía
  ├── nativeSpeech: NativeSpeech | null        (public) — null = no generado todavía
  ├── examples: Example[]                      (public) — 1 a 3 ejemplos
  ├── audioStatus: AudioStatus                 (public)
  ├── audioUrls: AudioUrls | null              (public)
  └── createdBy: string                        (public readonly) — userId del teacher/admin

  > Sin getters ni setters — campos públicos directos.
  > createdAt / updatedAt son responsabilidad de infraestructura (TypeORM @CreateDateColumn / @UpdateDateColumn).

  + create(id, expression, meaning, category, subcategory, ipaNotation, nativeSpeech, examples, createdBy): Flashcard  [static]
    → emite FlashcardCreatedEvent via record()

  + update(fields: Partial<FlashcardUpdateFields>): void
    → delega en métodos privados apply*()
    → emite FlashcardExpressionUpdatedEvent si cambia expression
    → emite FlashcardMeaningUpdatedEvent si cambia meaning

  + markAudioGenerating(): void   → emite FlashcardAudioGeneratingEvent
  + markAudioReady(audioUrls): void → emite FlashcardAudioReadyEvent
  + markAudioFailed(): void       → emite FlashcardAudioFailedEvent
  + fromPrimitives(p): Flashcard  [static]
  + toPrimitives(): FlashcardPrimitives

  Métodos privados (legibilidad):
  - applyExpression(value)
  - applyMeaning(value)
  - applyCategory(category?, subcategory?)
  - applyIpaNotation(value)
  - applyNativeSpeech(value)
  - applyExamples(examples)
```

> `AudioUrls` es un Value Object compuesto:  
> `{ expression: { us: string, uk: string, au: string }, examples: { us: string } }`

### Domain Events

```
DomainEvent (shared)
  ├── FlashcardCreatedEvent
  │     eventName: ididntcatchthat.content.flashcard.created
  │     emitido por: Flashcard.create() via record()
  │     atributos: FlashcardPrimitives completo
  │
  ├── FlashcardExpressionUpdatedEvent
  │     eventName: ididntcatchthat.content.flashcard.expression_updated
  │     emitido por: Flashcard.applyExpression() — solo si el valor cambia
  │     atributos: { flashcardId, expression }
  │
  ├── FlashcardMeaningUpdatedEvent
  │     eventName: ididntcatchthat.content.flashcard.meaning_updated
  │     emitido por: Flashcard.applyMeaning() — solo si el valor cambia
  │     atributos: { flashcardId, meaning }
  │
  ├── FlashcardAudioGeneratingEvent
  │     eventName: ididntcatchthat.content.flashcard.audio_generating
  │     emitido por: Flashcard.markAudioGenerating()
  │     atributos: { flashcardId }
  │
  ├── FlashcardAudioReadyEvent
  │     eventName: ididntcatchthat.content.flashcard.audio_ready
  │     emitido por: Flashcard.markAudioReady()
  │     atributos: { flashcardId, audioUrls }
  │
  └── FlashcardAudioFailedEvent
        eventName: ididntcatchthat.content.flashcard.audio_failed
        emitido por: Flashcard.markAudioFailed()
        atributos: { flashcardId }
```

> **Regla**: `record()` siempre en el aggregate. `pullDomainEvents()` siempre en el use case tras persistir.  
> Los atributos de cada evento contienen lo mínimo suficiente para que el consumer actúe sin queries adicionales.

---

## Repositorios e interfaces de dominio

### `FlashcardRepository`

```typescript
// content/domain/flashcard.repository.ts
export interface FlashcardRepository {
  save(flashcard: Flashcard): Promise<void>;
  search(id: FlashcardId): Promise<Flashcard | null>;
  match(criteria: Criteria): Promise<Flashcard[]>;
  count(criteria: Criteria): Promise<number>;
}

export const FLASHCARD_REPOSITORY = Symbol("FlashcardRepository");
```

### `AiExampleGenerator` (Domain Service interface)

```typescript
// content/domain/ai-example-generator.ts
export interface AiExampleGenerator {
  generate(expression: string, category: string): Promise<ExampleDraft[]>;
}

export type ExampleDraft = { textEn: string; textEs: string };

export const AI_EXAMPLE_GENERATOR = Symbol("AiExampleGenerator");
```

### `PdfFlashcardExtractor` (Domain Service interface)

```typescript
// content/domain/pdf-flashcard-extractor.ts
export interface PdfFlashcardExtractor {
  extract(pdfBuffer: Buffer): Promise<FlashcardDraft[]>;
}

export type FlashcardDraft = {
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: ExampleDraft[];
};

export const PDF_FLASHCARD_EXTRACTOR = Symbol("PdfFlashcardExtractor");
```

---

## Use Cases (Application Layer)

### `FlashcardCreator`

**Entrada**: `{ expression, meaning, category, subcategory, ipaNotation?, nativeSpeech?, examples[], createdBy }`  
**Salida**: `FlashcardPrimitives`

**Algoritmo**:

1. Generar `id` con `FlashcardId.generate()`.
2. Llamar `Flashcard.create(...)` → emite `FlashcardCreatedEvent` internamente via `record()`.
3. `FlashcardRepository.save(flashcard)`.
4. `eventBus.publish(flashcard.pullDomainEvents())` → handler async genera audio.
5. Retornar `flashcard.toPrimitives()`.

### `FlashcardBulkCreator`

**Entrada**: `{ flashcards: FlashcardCreateInput[], createdBy }`  
**Salida**: `{ created: number, flashcards: FlashcardPrimitives[] }`

**Algoritmo**:

1. Validar cada entrada.
2. Crear `Flashcard` por cada ítem — todos con `audioStatus: pending`.
3. Persistir en batch (transacción).
4. Publicar `FlashcardCreatedEvent` por cada uno.
5. Retornar count + primitives.

### `PdfFlashcardImporter`

**Entrada**: `{ pdfBuffer: Buffer, createdBy: string }`  
**Salida**: `{ drafts: FlashcardDraft[] }` — NO persiste, solo extrae drafts para revisión del teacher

**Algoritmo**:

1. Llamar `PdfFlashcardExtractor.extract(pdfBuffer)` → `FlashcardDraft[]`.
2. Retornar drafts sin persistir — el teacher revisa en UI y confirma con `FlashcardBulkCreator`.

### `FlashcardUpdater`

**Entrada**: `{ id, expression?, meaning?, category?, subcategory?, ipaNotation?, nativeSpeech?, examples?, updatedBy }`  
**Salida**: `FlashcardPrimitives`

**Algoritmo**:

1. Buscar flashcard — lanzar `FlashcardNotFound` si no existe.
2. Verificar autorización: `flashcard.createdBy === updatedBy` OR `updatedBy.role === admin` → `FlashcardAccessDenied`.
3. Llamar `flashcard.update(fields)` — emite eventos granulares internamente.
4. Persistir.
5. `eventBus.publish(flashcard.pullDomainEvents())`.
6. Retornar primitives.

### `FlashcardFinder`

**Entrada**: `{ id: string }`  
**Salida**: `FlashcardPrimitives`

**Algoritmo**:

1. Buscar flashcard — lanzar `FlashcardNotFound` si no existe.
2. Retornar primitives.

### `FlashcardSearcher`

**Entrada**: `{ category?, subcategory?, audioStatus?, page?, pageSize?, sort? }`  
**Salida**: `{ data: FlashcardPrimitives[], total: number, page: number, pageSize: number }`

**Algoritmo**:

1. Construir `Criteria` desde los parámetros.
2. Ejecutar `FlashcardRepository.match(criteria)` y `.count(criteria)` en paralelo.
3. Retornar resultado paginado.

### `AiExampleSuggester`

**Entrada**: `{ expression: string, category: string }`  
**Salida**: `{ examples: ExampleDraft[] }`

**Algoritmo**:

1. Llamar `AiExampleGenerator.generate(expression, category)`.
2. Retornar drafts — sin persistir.

### `CatalogQuerier`

**Entrada**: `{}` — sin parámetros  
**Salida**: `{ categories: CategoryCatalogEntry[] }`

```ts
CategoryCatalogEntry = {
  value: string           // e.g. "mastering_sounds"
  subcategories: {
    value: string         // e.g. "FLAP_T_PARTY_CITY"
    label: string         // e.g. "Flap T (party, city...)"
  }[]
}
```

**Algoritmo**:

1. Serializar el map estático `CATEGORIES_CATALOG` (enums TypeScript) en runtime.
2. Retornar la estructura sin consultar DB ni repositorio.

> No tiene repositorio, no tiene dominio mutable. Es un query puro sobre datos estáticos.

---

## Domain Errors

| Clase                   | Status HTTP | Cuándo                                                 |
| ----------------------- | ----------- | ------------------------------------------------------ |
| `FlashcardNotFound`     | 404         | Flashcard no existe en DB                              |
| `FlashcardAccessDenied` | 403         | El updatedBy no es el creador ni admin                 |
| `InvalidSubcategory`    | 422         | Subcategoría no pertenece a la categoría elegida       |
| `InvalidExampleCount`   | 422         | Más de 3 ejemplos o 0 ejemplos                         |
| `PdfExtractionFailed`   | 422         | El LLM no pudo extraer flashcards del PDF              |
| `AudioGenerationFailed` | —           | Error interno (no HTTP) — cambia `audioStatus: failed` |

---

## Mapa de endpoints

| Método | Ruta                     | Use Case               | Auth                   |
| ------ | ------------------------ | ---------------------- | ---------------------- |
| `POST` | `/flashcards`            | `FlashcardCreator`     | Bearer (teacher/admin) |
| `POST` | `/flashcards/bulk`       | `FlashcardBulkCreator` | Bearer (teacher/admin) |
| `POST` | `/flashcards/import/pdf` | `PdfFlashcardImporter` | Bearer (teacher/admin) |
| `PUT`  | `/flashcards/:id`        | `FlashcardUpdater`     | Bearer (teacher/admin) |
| `GET`  | `/flashcards/:id`        | `FlashcardFinder`      | Bearer (any)           |
| `GET`  | `/flashcards`            | `FlashcardSearcher`    | Bearer (any)           |
| `POST` | `/ai/suggest-examples`   | `AiExampleSuggester`   | Bearer (teacher/admin) |
| `GET`  | `/catalogs/categories`   | `CatalogQuerier`       | Public (sin auth)      |

> Los endpoints `GET /flashcards*` son públicos para cualquier usuario autenticado (user, guest, teacher, admin).  
> Los endpoints de escritura requieren rol `teacher` o `admin`.  
> `GET /catalogs/categories` no requiere token — responde con los enums serializados en runtime, sin DB.

---

## Estructura de archivos

```
apps/api/src/
  content/
    domain/
      flashcard.ts                        ← Aggregate Root
      example.ts                          ← Entidad
      flashcard-id.ts                     ← VO
      expression.ts                       ← VO
      meaning.ts                          ← VO
      category.ts                         ← VO enum
      subcategory.ts                      ← VO enum con validación cruzada por categoría
      categories-catalog.ts               ← CATEGORIES_CATALOG map estático (enums serializables)
      ipa-notation.ts                     ← VO (string non-empty) — el Aggregate lo contiene como IpaNotation | null
      native-speech.ts                    ← VO (string non-empty) — el Aggregate lo contiene como NativeSpeech | null
      audio-status.ts                     ← VO enum
      audio-urls.ts                       ← VO compuesto
      flashcard.repository.ts             ← interface + token FLASHCARD_REPOSITORY
      ai-example-generator.ts             ← interface (port) + token AI_EXAMPLE_GENERATOR
      pdf-flashcard-extractor.ts          ← interface (port) + token PDF_FLASHCARD_EXTRACTOR
      exceptions/
        flashcard-not-found.ts
        flashcard-access-denied.ts
        invalid-subcategory.ts
        invalid-example-count.ts
        pdf-extraction-failed.ts
      events/
        flashcard-created.event.ts
        flashcard-expression-updated.event.ts
        flashcard-meaning-updated.event.ts
        flashcard-audio-generating.event.ts
        flashcard-audio-ready.event.ts
        flashcard-audio-failed.event.ts

    application/
      create/
        flashcard-creator.ts
      bulk-create/
        flashcard-bulk-creator.ts
      import-pdf/
        pdf-flashcard-importer.ts
      update/
        flashcard-updater.ts
      find/
        flashcard-finder.ts
      search/
        flashcard-searcher.ts
      suggest-examples/
        ai-example-suggester.ts
      catalogs/
        catalog-querier.ts              ← serializa CATEGORIES_CATALOG, sin repositorio

    infrastructure/
      controllers/
        create-flashcard-post.controller.ts
        create-flashcard-post.payload.ts
        bulk-create-flashcards-post.controller.ts
        bulk-create-flashcards-post.payload.ts
        import-pdf-flashcards-post.controller.ts
        update-flashcard-put.controller.ts
        update-flashcard-put.payload.ts
        find-flashcard-get.controller.ts
        search-flashcards-get.controller.ts
        search-flashcards-get.query.ts
        suggest-examples-post.controller.ts
        suggest-examples-post.payload.ts
        get-categories-get.controller.ts  ← @Public(), sin guard de auth
      persistence/
        flashcard.entity.ts
        example.entity.ts
        typeorm-flashcard.repository.ts
      ai/
        deepseek-ai-example-generator.ts    ← implementa AiExampleGenerator
        deepseek-pdf-flashcard-extractor.ts ← implementa PdfFlashcardExtractor
      framework/
        content.module.ts

apps/api/test/
  content/
    domain/
      flashcard-mother.ts
      flashcard-id-mother.ts
      example-mother.ts
    application/
      create/
        flashcard-creator.spec.ts
        request-flashcard-creator-mother.ts
      bulk-create/
        flashcard-bulk-creator.spec.ts
        request-flashcard-bulk-creator-mother.ts
      import-pdf/
        pdf-flashcard-importer.spec.ts
      update/
        flashcard-updater.spec.ts
        request-flashcard-updater-mother.ts
      find/
        flashcard-finder.spec.ts
      search/
        flashcard-searcher.spec.ts
      suggest-examples/
        ai-example-suggester.spec.ts
    shared/
      infrastructure/
        create-flashcard.e2e-spec.ts
        bulk-create-flashcards.e2e-spec.ts
        update-flashcard.e2e-spec.ts
        search-flashcards.e2e-spec.ts
        suggest-examples.e2e-spec.ts
```

---

## Audio Pipeline (handler interno)

El `FlashcardCreatedEvent` dispara la generación de audio. `FlashcardExpressionUpdatedEvent` la regenera:

```
FlashcardCreatedEvent / FlashcardExpressionUpdatedEvent
    ↓
AudioGenerationHandler
    ├── flashcard.markAudioGenerating()  → emite FlashcardAudioGeneratingEvent
    ├── ElevenLabs API × 3 voces (US, UK, AU) para expression
    ├── ElevenLabs API × 1 voz (US) para examples concatenados
    ├── Upload × 4 archivos a Cloudflare CDN
    └── flashcard.markAudioReady({ expression: { us, uk, au }, examples: { us } })
        → emite FlashcardAudioReadyEvent

En caso de error:
    └── flashcard.markAudioFailed()  → emite FlashcardAudioFailedEvent
```

> El handler reintenta automáticamente si falla (retry configurable via DLQ de AMQP).  
> Solo `FlashcardExpressionUpdatedEvent` regenera audio — `FlashcardMeaningUpdatedEvent` no lo hace.

---

## Criterios de aceptación

### Crear flashcard

- [ ] `POST /flashcards` crea flashcard con `audioStatus: pending` y retorna 201.
- [ ] Teacher sin rol `teacher`/`admin` → 403.
- [ ] `expression` vacía → 422.
- [ ] Subcategoría inválida para la categoría → 422 `InvalidSubcategory`.
- [ ] Más de 3 ejemplos → 422 `InvalidExampleCount`.
- [ ] Se emite `FlashcardCreatedEvent`.

### Bulk create

- [ ] `POST /flashcards/bulk` con array válido crea todas las flashcards y retorna `{ created: N }`.
- [ ] Si alguna flashcard tiene datos inválidos → 422, ninguna se persiste (transacción).

### Import PDF

- [ ] `POST /flashcards/import/pdf` retorna array de drafts editables — no persiste.
- [ ] PDF sin contenido extraíble → 422 `PdfExtractionFailed`.

### Editar flashcard

- [ ] `PUT /flashcards/:id` actualiza flashcard y retorna 200.
- [ ] Flashcard inexistente → 404.
- [ ] Teacher que no creó la flashcard → 403 `FlashcardAccessDenied`.
- [ ] Admin puede editar cualquier flashcard.
- [ ] Cambio en `expression` → emite `FlashcardExpressionUpdatedEvent` → regenera audio.
- [ ] Cambio en `meaning` → emite `FlashcardMeaningUpdatedEvent` → NO regenera audio.
- [ ] Cambio solo en `meaning` → NO regenera audio.

### Buscar y filtrar

- [ ] `GET /flashcards` retorna lista paginada.
- [ ] Filtro por `category` funciona correctamente.
- [ ] Usuario sin token `teacher`/`admin` solo ve flashcards con `audioStatus: ready`.
- [ ] Teacher/admin puede filtrar también por `audioStatus: pending | generating | failed`.

### Sugerir ejemplos IA

- [ ] `POST /ai/suggest-examples` retorna entre 1 y 3 ejemplos — no persiste.
- [ ] LLM no disponible → 503 o error manejado graciosamente.

---

## Notas de implementación

- **`Subcategory` con validación cruzada**: el VO `Subcategory` recibe también la categoría para validar que la combinación es válida. Lanza `InvalidSubcategory` si no coincide.
- **`AiExampleGenerator`** y **`PdfFlashcardExtractor`**: implementados con DeepSeek en infra. El token `AI_EXAMPLE_GENERATOR` y `PDF_FLASHCARD_EXTRACTOR` permiten mockearlos fácilmente en tests.
- **Audio pipeline**: el handler `AudioGenerationHandler` vive en `content/application/` y escucha los eventos internos. En la fase MVP sin AMQP real, se puede llamar directamente desde el use case en modo fire-and-forget.
- **Flashcard visible de inmediato**: `audioStatus: pending` no bloquea la visibilidad. El cliente muestra skeleton de audio si status !== ready.
- **Import PDF es solo extracción**: `PdfFlashcardImporter` NO persiste — devuelve drafts. El teacher confirma con `FlashcardBulkCreator` en un segundo paso.
- **Paginación**: `GET /flashcards` usa el patrón Criteria con `page` y `pageSize`. Default: `page=1`, `pageSize=20`.
- **`createdBy`** referencia a `users.id` via FK — no se carga el objeto User, solo el id.
