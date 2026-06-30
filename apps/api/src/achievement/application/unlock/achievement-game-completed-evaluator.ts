import { Inject, Injectable } from '@nestjs/common';
import { GameSource } from '@/gaming/domain/game-source';
import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';
import {
  type TotalAttemptsQuery,
  TOTAL_ATTEMPTS_QUERY,
} from '@/achievement/domain/total-attempts.query';
import {
  type CompletedGamesCountQuery,
  COMPLETED_GAMES_COUNT_QUERY,
} from '@/achievement/domain/completed-games-count.query';
import {
  type ModuleCoverageQuery,
  MODULE_COVERAGE_QUERY,
} from '@/achievement/domain/module-coverage.query';
import { UserId } from '@/shared/domain/user-id';

@Injectable()
export class AchievementGameCompletedEvaluator {
  constructor(
    private readonly unlocker: AchievementUnlocker,
    @Inject(TOTAL_ATTEMPTS_QUERY)
    private readonly totalAttemptsQuery: TotalAttemptsQuery,
    @Inject(COMPLETED_GAMES_COUNT_QUERY)
    private readonly completedGamesCountQuery: CompletedGamesCountQuery,
    @Inject(MODULE_COVERAGE_QUERY)
    private readonly moduleCoverageQuery: ModuleCoverageQuery,
  ) {}

  async evaluate(attrs: GameCompletedAttributes): Promise<void> {
    if (attrs.userId === null) return;

    if (attrs.mode === 'study') {
      await this.evaluateStudy(attrs.userId);
      return;
    }

    if (attrs.mode !== 'game') return;

    await this.evaluateGame(attrs);
  }

  private async evaluateGame(attrs: GameCompletedAttributes): Promise<void> {
    if (attrs.userId === null) return;
    const userId = attrs.userId;
    const uid = new UserId(userId);

    await this.unlocker.unlock(userId, 'first_game');

    if (GameSource.create(attrs.source).isWeakest()) {
      await this.unlocker.unlock(userId, 'weak_warrior');
    }

    const cardCount = Number(attrs.cardCount);
    if (
      cardCount >= 10 &&
      attrs.totalCount >= 10 &&
      attrs.correctCount === attrs.totalCount
    ) {
      await this.unlocker.unlock(userId, 'perfect_session_10');
    }

    const totalPlayed = await this.totalAttemptsQuery.getTotalAttempts(uid);
    if (totalPlayed >= 100) {
      await this.unlocker.unlock(userId, 'cards_100');
    }

    const completedGames =
      await this.completedGamesCountQuery.countCompletedGames(uid);
    if (completedGames >= 10) {
      await this.unlocker.unlock(userId, 'games_10');
    }

    if (await this.moduleCoverageQuery.hasTouchedAllModules(uid)) {
      await this.unlocker.unlock(userId, 'module_all_touched');
    }
  }

  private async evaluateStudy(userId: string): Promise<void> {
    const uid = new UserId(userId);

    await this.unlocker.unlock(userId, 'study_first');

    const studySessions =
      await this.completedGamesCountQuery.countCompletedStudySessions(uid);
    if (studySessions >= 10) {
      await this.unlocker.unlock(userId, 'study_sessions_10');
    }
  }
}
