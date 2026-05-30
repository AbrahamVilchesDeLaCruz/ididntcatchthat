import { type RequestAttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export type { RequestAttemptRecorder };

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
