import { Inject, Injectable } from '@nestjs/common';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import { UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';
import { UserId } from '@/shared/domain/user-id';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { type RequestUpdateFlashcardStats } from './request-update-flashcard-stats';

export type { RequestUpdateFlashcardStats };

@Injectable()
export class UpdateFlashcardStats {
  constructor(
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly repository: UserFlashcardStatsRepository,
  ) {}

  async execute({
    userId,
    flashcardId,
    correct,
    mode,
  }: RequestUpdateFlashcardStats): Promise<void> {
    const uid = new UserId(userId);
    const fid = new FlashcardId(flashcardId);

    let stats = await this.repository.search(uid, fid);
    stats ??= UserFlashcardStats.create(uid, fid);

    if (mode === 'study') {
      stats.recordStudy(correct);
    } else {
      stats.recordPlay(correct);
    }

    await this.repository.save(stats);
  }
}
