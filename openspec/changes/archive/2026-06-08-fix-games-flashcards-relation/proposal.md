# Proposal: Fix Games/Flashcards Relation Query

## Intent

This proposal addresses a critical bug causing a 500 Internal Server Error when fetching flashcards for a specific game via the `GET /v1/games/{gameId}/flashcards` endpoint. The error, `relation "examples" does not exist`, occurs because the underlying SQL query incorrectly attempts to join a non-existent `examples` table, when `examples` is actually a JSONB column within the `flashcards` table. The goal is to correct the data access pattern to align with the existing database schema and restore the endpoint's functionality.

## Scope

### In Scope
- Modify the raw SQL query in `apps/api/src/gaming/infrastructure/persistence/typeorm-game-flashcard-query.ts`.
- Create a new integration test to verify that the `GET /v1/games/{gameId}/flashcards` endpoint successfully returns flashcards with their associated examples.
- Ensure existing tests for `GET /v1/games` continue to pass.

### Out of Scope
- Any changes to the `flashcards` table schema or the `FlashcardEntity`.
- Refactoring other queries that are not directly related to this endpoint.
- Performance optimization of the query beyond the required fix.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Each becomes a new `openspec/specs/<name>/spec.md`.
     Use kebab-case names (e.g., user-auth, data-export, api-rate-limiting).
     Leave empty if no new capabilities. -->
- None

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec.
     Use existing spec names from openspec/specs/. Leave empty if none. -->
- `game-content-retrieval`: The implementation of fetching game-specific flashcards will be corrected. The user-facing requirement (get flashcards for a game) remains the same, but the broken implementation is being fixed to meet that requirement.

## Approach

The fix involves a targeted modification of the raw SQL query within `typeorm-game-flashcard-query.ts`.

1.  **Remove Incorrect Subquery**: The current subquery that attempts to select from an `examples` table will be removed.
    ```sql
    -- This block will be deleted
    (
      SELECT json_agg(ex ORDER BY ex.position)
      FROM examples ex
      WHERE ex.flashcard_id = f.id
    ) AS examples
    ```

2.  **Direct Column Selection**: Replace the subquery with a direct reference to the `examples` JSONB column from the `flashcards` table alias (`f`).
    ```sql
    -- This line will be added to the main SELECT list
    f.examples AS examples
    ```

This change aligns the query with the database schema, where `flashcards.examples` already contains the necessary data in the correct JSON format.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/gaming/infrastructure/persistence/typeorm-game-flashcard-query.ts` | Modified | The raw SQL query will be corrected to fetch examples directly from the `flashcards.examples` JSONB column. |
| `apps/api/test/` | New | A new integration test file will be added to cover the `GET /v1/games/{gameId}/flashcards` endpoint, asserting a 200 OK response and validating the structure of the returned flashcard data. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| The `examples` JSONB data structure does not match the expected `GameFlashcardExample` interface. | Low | The `FlashcardEntity` and the database migration both define the column as `ExamplePrimitives[]`, which matches the expected interface. The new integration test will validate the response payload structure at runtime. |

## Rollback Plan

If the change introduces unexpected issues, it can be reverted by checking out the previous commit.
```bash
git checkout HEAD~1 apps/api/src/gaming/infrastructure/persistence/typeorm-game-flashcard-query.ts
# Remove the new test file if it was added
```
Since this is a self-contained bug fix for a non-functional endpoint, a rollback is low-risk.

## Dependencies

- None

## Success Criteria

- [x] All existing unit and integration tests pass.
- [x] The new integration test for `GET /v1/games/{gameId}/flashcards` passes, asserting a `200 OK` status and a valid response body.
- [x] A manual `curl` or Postman request to `GET /v1/games/{gameId}/flashcards` for a valid game ID returns a `200 OK` response with an array of flashcards, each containing an `examples` array.
