import { Inject, Injectable } from '@nestjs/common';
import { GameSource } from '@/gaming/domain/game-source';
import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import {
  type TotalAttemptsQuery,
  TOTAL_ATTEMPTS_QUERY,
} from '@/achievement/domain/total-attempts.query';
import { UserId } from '@/shared/domain/user-id';

@Injectable()
export class AchievementGameCompletedEvaluator {
  constructor(
    private readonly unlocker: AchievementUnlocker,
    @Inject(TOTAL_ATTEMPTS_QUERY)
    private readonly totalAttemptsQuery: TotalAttemptsQuery,
  ) {}

  async evaluate(attrs: GameCompletedAttributes): Promise<void> {
    if (attrs.userId === null) return;

    await this.unlocker.unlock(attrs.userId, 'first_game');

    if (GameSource.create(attrs.source).isWeakest() && attrs.mode === 'game') {
      await this.unlocker.unlock(attrs.userId, 'weak_warrior');
    }

    const cardCount = Number(attrs.cardCount);
    if (
      cardCount >= 10 &&
      attrs.totalCount >= 10 &&
      attrs.correctCount === attrs.totalCount
    ) {
      await this.unlocker.unlock(attrs.userId, 'perfect_session_10');
    }

    const totalAttempts = await this.totalAttemptsQuery.getTotalAttempts(
      new UserId(attrs.userId),
    );
    if (totalAttempts >= 100) {
      await this.unlocker.unlock(attrs.userId, 'cards_100');
    }
  }
}
