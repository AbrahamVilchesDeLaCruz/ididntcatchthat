import { Inject, Injectable } from '@nestjs/common';
import {
  type RankingProfileQuery,
  RANKING_PROFILE_QUERY,
} from '@/ranking/shared/domain/ranking-profile.query';
import {
  type RankingUserStatsQuery,
  RANKING_USER_STATS_QUERY,
} from '@/ranking/projection/domain/ranking-user-stats.query';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { GLOBAL_MODULE_SCOPE } from '@/ranking/shared/domain/ranking-key';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type RequestSyncRankingProfile = {
  userId: string;
  showInRanking: boolean;
  nickname: string;
};

@Injectable()
export class SyncRankingProfile {
  constructor(
    private readonly writer: RankingScoreWriter,
    @Inject(RANKING_PROFILE_QUERY)
    private readonly profileQuery: RankingProfileQuery,
    @Inject(RANKING_USER_STATS_QUERY)
    private readonly statsQuery: RankingUserStatsQuery,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute({
    userId,
    showInRanking,
    nickname,
  }: RequestSyncRankingProfile): Promise<void> {
    if (!showInRanking) {
      await this.writer.removeAllForUser(userId);
      this.logger.info('Ranking scores removed after opt-out', { userId });
      return;
    }

    await this.writer.renameAllForUser(userId, nickname);
    await this.backfillUser(userId, nickname);
    this.logger.info('Ranking scores synced after profile update', { userId });
  }

  private async backfillUser(userId: string, nickname: string): Promise<void> {
    const now = new Date();

    for (const period of this.writer.allPeriods()) {
      const since = this.writer.sinceDate(period, now);
      const games = await this.statsQuery.countCompletedGames(userId, since);
      await this.writer.applyScore(
        this.writer.key('most_active', period, GLOBAL_MODULE_SCOPE),
        userId,
        nickname,
        games,
      );

      const accuracy = await this.statsQuery.avgAccuracy(userId, since);
      if (accuracy !== null) {
        await this.writer.applyScore(
          this.writer.key('most_accurate', period, GLOBAL_MODULE_SCOPE),
          userId,
          nickname,
          accuracy,
        );
      }

      const correctSum = await this.statsQuery.sumCorrectCount(userId, since);
      await this.writer.applyScore(
        this.writer.key('top_scorer', period, GLOBAL_MODULE_SCOPE),
        userId,
        nickname,
        correctSum,
      );
    }

    const user = await this.profileQuery.findEligibleUser(userId);
    if (user) {
      await this.writer.applyScore(
        this.writer.key('best_streak', 'all_time', GLOBAL_MODULE_SCOPE),
        userId,
        nickname,
        user.currentStreak,
      );
    }

    const modules = await this.statsQuery.moduleMasteryLevels(userId);
    for (const { module, level } of modules) {
      await this.writer.applyScore(
        this.writer.key('module_master', 'all_time', module),
        userId,
        nickname,
        level,
      );
    }
  }
}
