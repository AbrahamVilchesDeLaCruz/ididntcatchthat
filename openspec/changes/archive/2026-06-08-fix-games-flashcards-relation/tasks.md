# Tasks: fix-games-flashcards-relation

## Review Workload Forecast

- **Estimated changed lines**: ~30 (5 lines fix + ~25 lines test)
- **400-line budget risk**: Low
- **Chained PRs recommended**: No
- **Decision needed before apply**: No

---

## Task-1: Fix SQL query in TypeOrmGameFlashcardQuery

- [x] Completed

- **Description**: Replace the incorrect subquery `FROM examples ex` with a direct reference to the `examples` JSONB column (`f.examples AS examples`) in the main SELECT clause.
- **Files**: `apps/api/src/gaming/infrastructure/persistence/typeorm-game-flashcard-query.ts`
- **Dependencies**: none
- **Verification**: `pnpm --filter @ididntcatchthat/api test` passes, and the query no longer references a non-existent table

## Task-2: Add integration test for the query

- [x] Completed

- **Description**: Write an integration test for `TypeOrmGameFlashcardQuery.findByGameId()` that validates:
  - Flashcards with examples stored as JSONB return correctly
  - Flashcards with empty examples array (`[]`) return with empty array
- **Files**: New test file (e.g., `apps/api/src/gaming/infrastructure/persistence/typeorm-game-flashcard-query.spec.ts`)
- **Dependencies**: Task-1
- **Verification**: Tests pass and cover both happy path and edge case

## Task-3: Verify end-to-end

- [x] Completed

- **Description**: Run the full test suite and verify the endpoint works
- **Dependencies**: Task-1, Task-2
- **Verification**: `pnpm --filter @ididntcatchthat/api test` passes, coverage thresholds met
