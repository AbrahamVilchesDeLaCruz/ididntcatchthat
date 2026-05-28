import { Attempt } from '@/gaming/domain/attempt';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export class AttemptMother {
  static random(
    overrides?: Partial<{
      id: string;
      gameId: string;
      flashcardId: string;
      correct: boolean;
      answeredAt: Date;
    }>,
  ): Attempt {
    return Attempt.fromPrimitives({
      id: overrides?.id ?? crypto.randomUUID(),
      gameId: overrides?.gameId ?? GameIdMother.random().value,
      flashcardId: overrides?.flashcardId ?? crypto.randomUUID(),
      correct: overrides?.correct ?? true,
      answeredAt: overrides?.answeredAt ?? new Date(),
    });
  }
}
