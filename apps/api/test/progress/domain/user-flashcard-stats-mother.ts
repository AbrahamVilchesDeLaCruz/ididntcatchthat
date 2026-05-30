import { UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';
import { type UserId } from '@/shared/domain/user-id';
import { type FlashcardId } from '@/shared/domain/flashcard-id';
import { ProgressUserIdMother } from './progress-user-id-mother';
import { ProgressFlashcardIdMother } from './progress-flashcard-id-mother';
import { DateMother } from '../../shared/domain/date-mother';
import { MotherCreator } from '../../shared/domain/mother-creator';

export class UserFlashcardStatsMother {
  static random(
    overrides?: Partial<{
      userId: string;
      flashcardId: string;
      timesStudied: number;
      timesPlayed: number;
      correctCount: number;
      accuracyRate: number;
      lastSeenAt: string;
    }>,
  ): UserFlashcardStats {
    const timesPlayed =
      overrides?.timesPlayed ??
      MotherCreator.random().number.int({ min: 0, max: 30 });
    const correctCount =
      overrides?.correctCount ??
      MotherCreator.random().number.int({ min: 0, max: timesPlayed });
    const accuracyRate = timesPlayed === 0 ? 0 : correctCount / timesPlayed;

    return UserFlashcardStats.fromPrimitives({
      userId: overrides?.userId ?? ProgressUserIdMother.random().value,
      flashcardId:
        overrides?.flashcardId ?? ProgressFlashcardIdMother.random().value,
      timesStudied:
        overrides?.timesStudied ??
        MotherCreator.random().number.int({ min: 0, max: 20 }),
      timesPlayed,
      correctCount,
      accuracyRate: overrides?.accuracyRate ?? accuracyRate,
      lastSeenAt: overrides?.lastSeenAt ?? DateMother.recent().toISOString(),
    });
  }

  static create(
    overrides: Partial<{
      userId: string;
      flashcardId: string;
      timesStudied: number;
      timesPlayed: number;
      correctCount: number;
      accuracyRate: number;
      lastSeenAt: string;
    }>,
  ): UserFlashcardStats {
    return UserFlashcardStatsMother.random(overrides);
  }

  static withAccuracy(rate: number): UserFlashcardStats {
    const timesPlayed = 10;
    const correctCount = Math.round(timesPlayed * rate);
    return UserFlashcardStats.fromPrimitives({
      userId: ProgressUserIdMother.random().value,
      flashcardId: ProgressFlashcardIdMother.random().value,
      timesStudied: 0,
      timesPlayed,
      correctCount,
      accuracyRate: rate,
      lastSeenAt: DateMother.recent().toISOString(),
    });
  }

  static fresh(userId: UserId, flashcardId: FlashcardId): UserFlashcardStats {
    return UserFlashcardStats.create(userId, flashcardId);
  }
}
