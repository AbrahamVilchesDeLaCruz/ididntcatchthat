import { Inject, Injectable } from '@nestjs/common';
import { type UserFlashcardStatsPrimitives } from '@/progress/domain/user-flashcard-stats';
import {
  type UserFlashcardStatsRepository,
  USER_FLASHCARD_STATS_REPOSITORY,
} from '@/progress/domain/user-flashcard-stats.repository';
import { UserId } from '@/shared/domain/user-id';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export interface RequestWeakestFlashcardSearcher {
  userId: string;
  limit?: number;
}

@Injectable()
export class WeakestFlashcardSearcher {
  constructor(
    @Inject(USER_FLASHCARD_STATS_REPOSITORY)
    private readonly repository: UserFlashcardStatsRepository,
  ) {}

  async execute(
    request: RequestWeakestFlashcardSearcher,
  ): Promise<UserFlashcardStatsPrimitives[]> {
    const limit = Math.min(request.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const stats = await this.repository.findWeakest(
      new UserId(request.userId),
      limit,
    );
    return stats.map((s) => s.toPrimitives());
  }
}
