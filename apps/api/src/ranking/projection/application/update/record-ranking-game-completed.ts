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

export type RequestRecordRankingGameCompleted = {
  userId: string;
  mode: string;
  finishedAt: string;
};

@Injectable()
export class RecordRankingGameCompleted {
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
    mode,
    finishedAt,
  }: RequestRecordRankingGameCompleted): Promise<void> {
    if (mode !== 'game') return;

    const user = await this.profileQuery.findEligibleUser(userId);
    if (!user) return;

    const at = new Date(finishedAt);

    await this.writer.incrementScore(
      this.writer.key('most_active', 'all_time', GLOBAL_MODULE_SCOPE),
      userId,
      user.nickname,
      1,
    );

    for (const period of ['weekly', 'monthly'] as const) {
      const since = this.writer.sinceDate(period, at);
      const count = await this.statsQuery.countCompletedGames(userId, since);
      await this.writer.applyScore(
        this.writer.key('most_active', period, GLOBAL_MODULE_SCOPE),
        userId,
        user.nickname,
        count,
      );
    }

    this.logger.info('Ranking score updated for game completed', { userId });
  }
}
