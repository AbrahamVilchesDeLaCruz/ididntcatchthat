# Progress Domain Spec

## Requirements

### Requirement: Weakest Flashcards with Expression

`GET /v1/progress/flashcards/weakest` MUST return an `expression` field for each flashcard.

A dedicated Query object SHALL handle the read (CQRS) — no changes to the existing repository.

The response MUST include: `flashcardId`, `expression`, `module` (category), `errorCount`, `lastAttemptAt`.

The frontend SHALL display `expression` instead of the UUID in the weakest flashcards table.

#### Scenario: Happy path

- GIVEN a user has flashcard stats.
- WHEN a client sends a GET request to `/v1/progress/flashcards/weakest`.
- THEN the endpoint SHALL return stats with `expression` filled from the JOIN to the flashcards table.

#### Scenario: Empty stats

- GIVEN a user has no flashcard stats.
- WHEN a client sends a GET request to `/v1/progress/flashcards/weakest`.
- THEN the endpoint SHALL return `[]`.

#### Scenario: Flashcard deleted

- GIVEN a flashcard was deleted but stats remain.
- WHEN a client sends a GET request to `/v1/progress/flashcards/weakest`.
- THEN the JOIN returns null and `expression` SHOULD default to "Unknown" (or handle gracefully).

### Requirement: CQRS Query for Weakest Flashcards

A `WeakestFlashcardQuery` interface MUST exist in `progress/domain/` with a `findWeakest()` method.

The `TypeOrmWeakestFlashcardQuery` implementation MUST use a SQL JOIN to the `flashcards` table, selecting `f.expression` and `f.category AS module`.

`errorCount` MUST be computed as `timesPlayed - correctCount`.

`WeakestFlashcardSearcher` MUST use the Query instead of the Repository.

The existing `TypeOrmUserFlashcardStatsRepository.findWeakest()` MUST remain untouched.

#### Scenario: Query returns expression and module

- GIVEN a user with flashcard stats and associated flashcards.
- WHEN `WeakestFlashcardQuery.findWeakest()` is called.
- THEN the returned DTOs SHALL include `expression` and `module` fields.
- AND `errorCount` SHALL equal `timesPlayed - correctCount`.

### Non-goals

- No schema changes (no new tables, no new columns).
- No changes to the event-sourced update flow.
- No changes to `module_progress` endpoint.
