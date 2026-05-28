import { type UserId } from '@/shared/domain/user-id';
import { type FlashcardId } from '@/shared/domain/flashcard-id';
import { type UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';
import { type ModuleName } from '@/progress/domain/module-name';

export interface UserFlashcardStatsRepository {
  save(stats: UserFlashcardStats): Promise<void>;
  search(
    userId: UserId,
    flashcardId: FlashcardId,
  ): Promise<UserFlashcardStats | null>;
  findWeakest(userId: UserId, limit: number): Promise<UserFlashcardStats[]>;
  findByModule(
    userId: UserId,
    module: ModuleName,
  ): Promise<UserFlashcardStats[]>;
}

export const USER_FLASHCARD_STATS_REPOSITORY = Symbol(
  'UserFlashcardStatsRepository',
);
