import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export interface RequestAttemptRecorder {
  gameId: string;
  flashcardId: string;
  correct: boolean;
  userId: string | null;
}

export class RequestAttemptRecorderMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestAttemptRecorder>,
  ): RequestAttemptRecorder {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      flashcardId: 'fc-1',
      correct: true,
      userId: 'user-123',
      ...overrides,
    };
  }

  static guest(gameId?: string): RequestAttemptRecorder {
    return RequestAttemptRecorderMother.random(gameId, { userId: null });
  }
}
