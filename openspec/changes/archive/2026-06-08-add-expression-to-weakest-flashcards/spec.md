# Spec: add-expression-to-weakest-flashcards

## Requirements

1. `GET /v1/progress/flashcards/weakest` must return `expression` field for each flashcard
2. A dedicated Query object handles the read (CQRS) — no changes to the existing repository
3. The response includes: `flashcardId`, `expression`, `module` (category), `errorCount`, `lastAttemptAt`
4. Frontend displays `expression` instead of the UUID in the weakest flashcards table

## Acceptance Criteria

### Backend
- [ ] AC1: New `WeakestFlashcardQuery` interface exists in `progress/domain/` with `findWeakest()` method
- [ ] AC2: `TypeOrmWeakestFlashcardQuery` implementation uses SQL JOIN to `flashcards` table selecting `f.expression` and `f.category AS module`
- [ ] AC3: `errorCount` is computed as `timesPlayed - correctCount`
- [ ] AC4: `WeakestFlashcardSearcher` uses the new Query instead of the Repository
- [ ] AC5: Existing `TypeOrmUserFlashcardStatsRepository.findWeakest()` remains untouched

### Frontend
- [ ] AC6: `WeakFlashcardApiModel` and `WeakFlashcardVM` include `expression: string`
- [ ] AC7: `WeakFlashcardsTable` shows expression text instead of flashcard ID
- [ ] AC8: Mapper maps `expression` correctly

### Non-goals
- No schema changes (no new tables, no new columns)
- No changes to the event-sourced update flow
- No changes to `module_progress` endpoint

## Scenarios

1. **Happy path**: User with flashcard stats → endpoint returns stats with `expression` filled from JOIN
2. **Empty stats**: User with no flashcard stats → endpoint returns `[]`
3. **Flashcard deleted**: If a flashcard was deleted, the JOIN returns null — `expression` should default to "Unknown" or handle gracefully
