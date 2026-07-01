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

export type RequestRecordRankingAttempt = {
  userId: string;
  mode: string;
  correct: boolean;
  answeredAt: string;
};

@Injectable()
export class RecordRankingAttempt {
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
    correct,
    answeredAt,
  }: RequestRecordRankingAttempt): Promise<void> {
    if (mode !== 'game') return;

    const user = await this.profileQuery.findEligibleUser(userId);
    if (!user) return;

    const at = new Date(answeredAt);

    if (correct) {
      for (const period of this.writer.allPeriods()) {
        const since = this.writer.sinceDate(period, at);
        const correctCount = await this.statsQuery.sumCorrectCount(
          userId,
          since,
        );
        await this.writer.applyScore(
          this.writer.key('top_scorer', period, GLOBAL_MODULE_SCOPE),
          userId,
          user.nickname,
          correctCount,
        );
      }
    }

    for (const period of this.writer.allPeriods()) {
      const since = this.writer.sinceDate(period, at);
      const accuracy = await this.statsQuery.avgAccuracy(userId, since);
      if (accuracy !== null) {
        await this.writer.applyScore(
          this.writer.key('most_accurate', period, GLOBAL_MODULE_SCOPE),
          userId,
          user.nickname,
          accuracy,
        );
      }
    }

    this.logger.info('Ranking score updated for attempt', { userId });
  }
}
