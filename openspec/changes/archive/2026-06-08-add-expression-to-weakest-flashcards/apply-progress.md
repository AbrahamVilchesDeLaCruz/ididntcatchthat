# Apply Progress: add-expression-to-weakest-flashcards

## Mode

Strict TDD

## Completed Tasks

- [x] Task-1: Create `WeakestFlashcardQuery` interface and DI token
- [x] Task-2: Implement `TypeOrmWeakestFlashcardQuery` with SQL JOIN and DTO mapping
- [x] Task-3: Update `WeakestFlashcardSearcher` to use query abstraction and return DTOs
- [x] Task-4: Register query provider in `ProgressModule`
- [x] Task-5: Update frontend API model, VM, mapper, and table rendering to show expression
- [x] Task-6: Verify API tests, client lint, and TypeScript compilation

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Task-1 | `apps/api/test/progress/application/search/weakest-flashcard-searcher.spec.ts` | Unit | N/A (new contract) | ✅ Wrote query-based expectations first | ✅ Passes after creating domain query contract | ➖ Skipped (structural contract-only task) | ➖ None needed |
| Task-2 | `apps/api/test/progress/infrastructure/persistence/typeorm/typeorm-weakest-flashcard.query.spec.ts` | Unit | N/A (new file) | ✅ Wrote mapping + SQL call assertions before implementation (import failed) | ✅ 2/2 passed after implementation | ✅ Two scenarios: DTO mapping + SQL args/order | ➖ None needed |
| Task-3 | `apps/api/test/progress/application/search/weakest-flashcard-searcher.spec.ts` | Unit | ✅ Existing file baseline (4/5 before change) | ✅ Failed with `s.toPrimitives is not a function` | ✅ 5/5 passed after switching to query return DTOs | ✅ Happy path + default/capped/custom/empty cases | ➖ None needed |
| Task-4 | `apps/api/test/progress/application/search/weakest-flashcard-searcher.spec.ts` + full API suite | Unit | ✅ Focused tests green before module wiring | ✅ Provider wiring absent before implementation | ✅ Full API suite passed (45/45) after provider registration | ➖ Single wiring behavior covered by integration of suite | ➖ None needed |
| Task-5 | `apps/client/src/containers/stats/__tests__/stats.mapper.test.ts`, `apps/client/src/containers/stats/components/__tests__/WeakFlashcardsTable.test.tsx` | Unit + Integration | N/A (new tests) | ✅ 4 failures (missing `expression`, old header) | ✅ 4/4 passed after frontend updates | ✅ Mapper + table header/value + removed old header | ➖ None needed |
| Task-6 | Verification commands | Verification | ✅ Ran full checks | ✅ N/A | ✅ API tests, client lint, and TS checks passed | ➖ N/A | ➖ N/A |

## Test Summary

- **Total tests written**: 4 new tests (2 API infra + 2 client suites with 4 assertions)
- **Total tests passing**:
  - API focused: 7/7 (searcher + query specs)
  - Client focused: 4/4
  - API full suite: 190/190
- **Layers used**: Unit (API + client mapper), Integration (client component rendering)
- **Approval tests**: None — no behavior-preserving refactor-only task
- **Pure functions created/updated**: 1 (`mapWeakFlashcard` updated)

## Verification Commands (Executed)

- `pnpm --filter @ididntcatchthat/api test`
- `pnpm --filter @ididntcatchthat/client lint`
- `pnpm --filter @ididntcatchthat/api exec tsc --noEmit -p tsconfig.json`
- `pnpm --filter @ididntcatchthat/client exec tsc --noEmit -p tsconfig.app.json`

## Workload / PR Boundary

- Mode: single PR
- Current work unit: add-expression-to-weakest-flashcards (full scope)
- Boundary: weakest flashcards read model + searcher DI + stats frontend mapping/rendering + verification
- Estimated review budget impact: within forecast (low risk, under 400-line guideline)
