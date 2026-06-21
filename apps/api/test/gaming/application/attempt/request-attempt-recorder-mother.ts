import { type RequestAttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { BooleanMother } from '@test/shared/domain/boolean-mother';

export type { RequestAttemptRecorder };

export class RequestAttemptRecorderMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestAttemptRecorder>,
  ): RequestAttemptRecorder {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      flashcardId: UuidMother.random(),
      correct: BooleanMother.random(),
      userId: UserIdMother.random().value,
      ...overrides,
    };
  }

  static guest(gameId?: string): RequestAttemptRecorder {
    return RequestAttemptRecorderMother.random(gameId, { userId: null });
  }
}
