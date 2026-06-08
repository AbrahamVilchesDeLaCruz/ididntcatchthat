# Tasks: add-expression-to-weakest-flashcards

## Review Workload Forecast

- **Estimated changed lines**: ~100 (40 backend + 30 frontend + 30 new files)
- **400-line budget risk**: Low
- **Chained PRs recommended**: No
- **Decision needed before apply**: No

---

## Completion Status

- [x] Task-1: Create WeakestFlashcardQuery interface (domain)
- [x] Task-2: Implement TypeOrmWeakestFlashcardQuery (infrastructure)
- [x] Task-3: Update WeakestFlashcardSearcher to use Query
- [x] Task-4: Register Query in ProgressModule
- [x] Task-5: Update frontend types, mapper, and component
- [x] Task-6: Verify with tests/lint/typecheck

---

## Task-1: Create WeakestFlashcardQuery interface (domain)

- **Description**: Create the `WeakestFlashcardQuery` interface in `progress/domain/` with a `findWeakest(userId, limit)` method and a `WeakestFlashcardDto` type. Export `WEAKEST_FLASHCARD_QUERY` DI token.
- **Files**: `apps/api/src/progress/domain/weakest-flashcard.query.ts` (new)
- **Dependencies**: none
- **Verification**: Interface compiles, DTO types are correct

## Task-2: Implement TypeOrmWeakestFlashcardQuery (infrastructure)

- **Description**: Implement the Query with raw SQL JOIN:
  ```sql
  SELECT ufs.*, f.expression, f.category AS module,
         (ufs.times_played - ufs.correct_count) AS error_count
  FROM user_flashcard_stats ufs
  JOIN flashcards f ON f.id = ufs.flashcard_id
  WHERE ufs.user_id = $1
  ORDER BY ufs.accuracy_rate ASC
  LIMIT $2
  ```
- **Files**: `apps/api/src/progress/infrastructure/persistence/typeorm/typeorm-weakest-flashcard.query.ts` (new)
- **Dependencies**: Task-1
- **Verification**: Query returns `expression` and `module` fields

## Task-3: Update WeakestFlashcardSearcher to use Query

- **Description**: Replace `USER_FLASHCARD_STATS_REPOSITORY` injection with `WEAKEST_FLASHCARD_QUERY` in `WeakestFlashcardSearcher`. Update the execute method to call `query.findWeakest()` and return the DTOs.
- **Files**: `apps/api/src/progress/application/search/weakest-flashcard-searcher.ts`
- **Dependencies**: Task-1, Task-2
- **Verification**: Searcher compiles and uses the Query instead of Repository

## Task-4: Register Query in ProgressModule

- **Description**: Add the new Query provider to `ProgressModule` and update `WeakestFlashcardSearcher` DI
- **Files**: `apps/api/src/progress/infrastructure/framework/progress.module.ts`
- **Dependencies**: Task-1, Task-2, Task-3
- **Verification**: Module compiles and DI is correctly wired

## Task-5: Update frontend types, mapper, and component

- **Description**: Update `WeakFlashcardApiModel` and `WeakFlashcardVM` to include `expression`. Update `mapWeakFlashcard` to map `expression`. Update `WeakFlashcardsTable` to render expression instead of flashcard ID.
- **Files**:
  - `apps/client/src/containers/stats/api/stats.api-model.ts`
  - `apps/client/src/containers/stats/stats.types.ts`
  - `apps/client/src/containers/stats/stats.mapper.ts`
  - `apps/client/src/containers/stats/components/WeakFlashcardsTable.tsx`
- **Dependencies**: Task-4 (so backend format is defined)
- **Verification**: Frontend compiles and shows expression text

## Task-6: Verify with tests

- **Description**: Run the test suite to verify nothing is broken
- **Dependencies**: Task-5
- **Verification**: `pnpm --filter @ididntcatchthat/api test` and `pnpm --filter @ididntcatchthat/client test` pass
