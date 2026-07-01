import { Inject, Injectable } from '@nestjs/common';
import {
  type RankingProfileQuery,
  RANKING_PROFILE_QUERY,
} from '@/ranking/shared/domain/ranking-profile.query';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { GLOBAL_MODULE_SCOPE } from '@/ranking/shared/domain/ranking-key';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type RequestRecordRankingStreakUpdated = {
  userId: string;
  newStreak: number;
};

@Injectable()
export class RecordRankingStreakUpdated {
  constructor(
    private readonly writer: RankingScoreWriter,
    @Inject(RANKING_PROFILE_QUERY)
    private readonly profileQuery: RankingProfileQuery,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute({
    userId,
    newStreak,
  }: RequestRecordRankingStreakUpdated): Promise<void> {
    const user = await this.profileQuery.findEligibleUser(userId);
    if (!user) return;

    await this.writer.applyScore(
      this.writer.key('best_streak', 'all_time', GLOBAL_MODULE_SCOPE),
      userId,
      user.nickname,
      newStreak,
    );

    this.logger.info('Ranking score updated for streak', { userId, newStreak });
  }
}
