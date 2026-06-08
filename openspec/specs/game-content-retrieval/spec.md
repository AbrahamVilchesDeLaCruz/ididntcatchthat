# Delta for game-content-retrieval

## MODIFIED Requirements

### Requirement: Retrieve Game Flashcards with Examples

The system MUST provide an endpoint to retrieve all flashcards associated with a specific game, including their embedded example sentences. The query to fetch this data MUST correctly source examples from the `flashcards.examples` JSONB column.

(Previously: The query attempted to join a non-existent `examples` table, causing the endpoint to fail.)

#### Scenario: Successfully retrieve flashcards for a game with examples

- GIVEN a game exists with an ID.
- AND this game has associated flashcards.
- AND these flashcards have one or more examples stored in their `examples` JSONB column.
- WHEN a client sends a GET request to `/v1/games/{gameId}/flashcards`.
- THEN the system SHALL return a 200 OK status.
- AND the response body MUST be an array of flashcards.
- AND each flashcard object in the array MUST contain an `examples` property which is an array of example objects.

#### Scenario: Successfully retrieve flashcards for a game with no examples

- GIVEN a game exists with an ID.
- AND this game has associated flashcards.
- AND these flashcards have an empty array (`[]`) in their `examples` JSONB column.
- WHEN a client sends a GET request to `/v1/games/{gameId}/flashcards`.
- THEN the system SHALL return a 200 OK status.
- AND the response body MUST be an array of flashcards.
- AND each flashcard object in the array MUST contain an `examples` property which is an empty array.

#### Scenario: Endpoint returns valid DTO structure

- GIVEN a game exists with associated flashcards.
- WHEN a client sends a GET request to `/v1/games/{gameId}/flashcards`.
- THEN the structure of each object in the response array MUST be compatible with the `GameFlashcardDto`.
- AND the structure of each example in the `examples` array MUST be compatible with the `GameFlashcardExample` interface.
