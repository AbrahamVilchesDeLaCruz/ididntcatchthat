import { Inject, Injectable } from '@nestjs/common';
import {
  type RankingProfileQuery,
  RANKING_PROFILE_QUERY,
} from '@/ranking/shared/domain/ranking-profile.query';
import { RankingScoreWriter } from '@/ranking/projection/domain/ranking-score-writer';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type RequestRecordRankingModuleMastery = {
  userId: string;
  module: string;
  level: number;
};

@Injectable()
export class RecordRankingModuleMastery {
  constructor(
    private readonly writer: RankingScoreWriter,
    @Inject(RANKING_PROFILE_QUERY)
    private readonly profileQuery: RankingProfileQuery,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute({
    userId,
    module,
    level,
  }: RequestRecordRankingModuleMastery): Promise<void> {
    const user = await this.profileQuery.findEligibleUser(userId);
    if (!user) return;

    await this.writer.applyScore(
      this.writer.key('module_master', 'all_time', module),
      userId,
      user.nickname,
      level,
    );

    this.logger.info('Ranking score updated for module mastery', {
      userId,
      module,
      level,
    });
  }
}
