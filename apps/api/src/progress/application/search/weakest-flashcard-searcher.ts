import { Inject, Injectable } from '@nestjs/common';
import { type UserFlashcardStatsPrimitives } from '@/progress/domain/user-flashcard-stats';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import { UserId } from '@/shared/domain/user-id';
import { type RequestWeakestFlashcardSearcher } from './request-weakest-flashcard-searcher';

export type { RequestWeakestFlashcardSearcher };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Injectable()
export class WeakestFlashcardSearcher {
  constructor(
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly repository: UserFlashcardStatsRepository,
  ) {}

  async execute({
    userId,
    limit,
  }: RequestWeakestFlashcardSearcher): Promise<UserFlashcardStatsPrimitives[]> {
    const cappedLimit = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const stats = await this.repository.findWeakest(
      new UserId(userId),
      cappedLimit,
    );
    return stats.map((s) => s.toPrimitives());
  }
}
