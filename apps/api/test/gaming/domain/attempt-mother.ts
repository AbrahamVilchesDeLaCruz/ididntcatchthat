import { Attempt } from '@/gaming/domain/attempt';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { DateMother } from '@test/shared/domain/date-mother';
import { BooleanMother } from '@test/shared/domain/boolean-mother';

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
      id: overrides?.id ?? UuidMother.random(),
      gameId: overrides?.gameId ?? GameIdMother.random().value,
      flashcardId: overrides?.flashcardId ?? UuidMother.random(),
      correct: overrides?.correct ?? BooleanMother.random(),
      answeredAt: overrides?.answeredAt ?? DateMother.recent(),
    });
  }

  static create(
    gameId?: string,
    flashcardId?: string,
    correct = true,
  ): Attempt {
    return Attempt.create(
      gameId ?? GameIdMother.random().value,
      flashcardId ?? UuidMother.random(),
      correct,
    );
  }
}
