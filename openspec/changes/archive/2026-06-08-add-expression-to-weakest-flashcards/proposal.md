# Proposal: add-expression-to-weakest-flashcards

**Type**: enhancement
**Intent**: Add the flashcard `expression` text to the weakest flashcards endpoint so users see the actual English phrase instead of a UUID.

## Approach: CQRS Query

Following the existing CQRS pattern used in gaming (e.g. `GameFlashcardQuery`), we create a dedicated Query object so the repository stays write-only.

### Backend (`apps/api/`)

1. **`apps/api/src/progress/domain/weakest-flashcard.query.ts`** — New interface:
   - `findWeakest(userId: UserId, limit: number): Promise<WeakestFlashcardDto[]>`
   - `WeakestFlashcardDto` includes: `flashcardId`, `expression`, `module`, `errorCount`, `lastAttemptAt`
   - Export DI token: `WEAKEST_FLASHCARD_QUERY = Symbol('WeakestFlashcardQuery')`

2. **`apps/api/src/progress/infrastructure/persistence/typeorm/typeorm-weakest-flashcard.query.ts`** — New implementation:
   - Raw SQL with JOIN: `user_flashcard_stats ufs JOIN flashcards f ON f.id = ufs.flashcard_id`
   - Select: `ufs.*, f.expression, f.category AS module`
   - Compute `errorCount = ufs.times_played - ufs.correct_count` (or compute in DTO mapping)
   - Order by `ufs.accuracy_rate ASC`, limit

3. **`apps/api/src/progress/application/search/weakest-flashcard-searcher.ts`** — Modify:
   - Inject `WEAKEST_FLASHCARD_QUERY` instead of `USER_FLASHCARD_STATS_REPOSITORY`
   - Return `WeakestFlashcardDto[]` directly

4. **`apps/api/src/progress/infrastructure/framework/progress.module.ts`** — Register:
   - `{ provide: WEAKEST_FLASHCARD_QUERY, useClass: TypeOrmWeakestFlashcardQuery }`
   - Update providers for `WeakestFlashcardSearcher`

5. **`apps/api/src/progress/infrastructure/controllers/get-weakest-flashcards-get.controller.ts`** — Update response type to include `expression`

### Frontend (`apps/client/`)

6. **`apps/client/src/containers/stats/api/stats.api-model.ts`** — Update `WeakFlashcardApiModel`:
   - Add `expression: string`
   - Add `module: string`
   - Add `errorCount: number`
   - Remove fields that won't be returned

7. **`apps/client/src/containers/stats/stats.types.ts`** — Add `expression: string` to `WeakFlashcardVM`

8. **`apps/client/src/containers/stats/stats.mapper.ts`** — Map `expression` in `mapWeakFlashcard`

9. **`apps/client/src/containers/stats/components/WeakFlashcardsTable.tsx`** — Replace "Flashcard ID" column with "Expresión" showing `item.expression`

### Files NOT modified (keeping CQRS clean)
- `typeorm-user-flashcard-stats.repository.ts` — no changes, stays write-only
- `user-flashcard-stats.entity.ts` — no changes
- `user-flashcard-stats.ts` (domain) — no changes

## Risk Level

Low — follows established CQRS pattern, no schema changes, existing repo untouched.
