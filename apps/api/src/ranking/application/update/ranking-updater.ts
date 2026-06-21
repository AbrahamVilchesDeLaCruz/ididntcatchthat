import { Inject, Injectable } from '@nestjs/common';
import { RankingKey, GLOBAL_MODULE_SCOPE } from '@/ranking/domain/ranking-key';
import { RankingPeriodBucket } from '@/ranking/domain/ranking-period-bucket';
import { Ranking } from '@/ranking/domain/ranking';
import { RankingId } from '@/ranking/domain/ranking-id';
import {
  type RankingRepository,
  RANKING_REPOSITORY,
} from '@/ranking/domain/ranking.repository';
import {
  type RankingUserReader,
  RANKING_USER_READER,
} from '@/ranking/domain/ranking-user.reader';
import {
  type RankingUserStatsQuery,
  RANKING_USER_STATS_QUERY,
} from '@/ranking/domain/ranking-user-stats.query';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

@Injectable()
export class RankingUpdater {
  constructor(
    @Inject(RANKING_REPOSITORY)
    private readonly repository: RankingRepository,
    @Inject(RANKING_USER_READER)
    private readonly userReader: RankingUserReader,
    @Inject(RANKING_USER_STATS_QUERY)
    private readonly statsQuery: RankingUserStatsQuery,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async recordGameCompleted(
    userId: string,
    mode: string,
    finishedAt: string,
  ): Promise<void> {
    if (mode !== 'game') return;

    const user = await this.userReader.findEligibleUser(userId);
    if (!user) return;

    const at = new Date(finishedAt);

    await this.incrementScore(
      this.key('most_active', 'all_time', GLOBAL_MODULE_SCOPE),
      userId,
      user.nickname,
      1,
    );

    for (const period of ['weekly', 'monthly'] as const) {
      const since = RankingPeriodBucket.sinceDate(period, at);
      const count = await this.statsQuery.countCompletedGames(userId, since);
      await this.applyScore(
        this.key('most_active', period, GLOBAL_MODULE_SCOPE),
        userId,
        user.nickname,
        count,
      );
    }

    this.logger.info('Ranking updated for game completed', { userId });
  }

  async recordAttempt(
    userId: string,
    mode: string,
    correct: boolean,
    answeredAt: string,
  ): Promise<void> {
    if (mode !== 'game') return;

    const user = await this.userReader.findEligibleUser(userId);
    if (!user) return;

    if (correct) {
      for (const period of RankingPeriodBucket.allPeriods()) {
        await this.incrementScore(
          this.key('top_scorer', period, GLOBAL_MODULE_SCOPE),
          userId,
          user.nickname,
          1,
        );
      }
    }

    const at = new Date(answeredAt);
    for (const period of RankingPeriodBucket.allPeriods()) {
      const since = RankingPeriodBucket.sinceDate(period, at);
      const accuracy = await this.statsQuery.avgAccuracy(userId, since);
      if (accuracy !== null) {
        await this.applyScore(
          this.key('most_accurate', period, GLOBAL_MODULE_SCOPE),
          userId,
          user.nickname,
          accuracy,
        );
      }
    }

    this.logger.info('Ranking updated for attempt', { userId });
  }

  async recordStreakUpdated(userId: string, newStreak: number): Promise<void> {
    const user = await this.userReader.findEligibleUser(userId);
    if (!user) return;

    await this.applyScore(
      this.key('best_streak', 'all_time', GLOBAL_MODULE_SCOPE),
      userId,
      user.nickname,
      newStreak,
    );
  }

  async recordModuleMastery(
    userId: string,
    module: string,
    level: number,
  ): Promise<void> {
    const user = await this.userReader.findEligibleUser(userId);
    if (!user) return;

    await this.applyScore(
      this.key('module_master', 'all_time', module),
      userId,
      user.nickname,
      level,
    );
  }

  async syncProfile(
    userId: string,
    showInRanking: boolean,
    nickname: string,
  ): Promise<void> {
    if (!showInRanking) {
      await this.removeAllForUser(userId);
      return;
    }

    await this.renameAllForUser(userId, nickname);
    await this.backfillUser(userId, nickname);
  }

  async backfillUser(userId: string, nickname: string): Promise<void> {
    const now = new Date();

    for (const period of RankingPeriodBucket.allPeriods()) {
      const since = RankingPeriodBucket.sinceDate(period, now);
      const games = await this.statsQuery.countCompletedGames(userId, since);
      await this.applyScore(
        this.key('most_active', period, GLOBAL_MODULE_SCOPE),
        userId,
        nickname,
        games,
      );

      const accuracy = await this.statsQuery.avgAccuracy(userId, since);
      if (accuracy !== null) {
        await this.applyScore(
          this.key('most_accurate', period, GLOBAL_MODULE_SCOPE),
          userId,
          nickname,
          accuracy,
        );
      }

      const correctSum = await this.statsQuery.sumCorrectCount(userId, since);
      await this.applyScore(
        this.key('top_scorer', period, GLOBAL_MODULE_SCOPE),
        userId,
        nickname,
        correctSum,
      );
    }

    const user = await this.userReader.findEligibleUser(userId);
    if (user) {
      await this.applyScore(
        this.key('best_streak', 'all_time', GLOBAL_MODULE_SCOPE),
        userId,
        nickname,
        user.currentStreak,
      );
    }

    const modules = await this.statsQuery.moduleMasteryLevels(userId);
    for (const { module, level } of modules) {
      await this.applyScore(
        this.key('module_master', 'all_time', module),
        userId,
        nickname,
        level,
      );
    }
  }

  private async incrementScore(
    key: RankingKey,
    userId: string,
    nickname: string,
    delta: number,
  ): Promise<void> {
    const id = RankingId.fromKey(key, userId);
    const existing = await this.repository.search(id);

    const ranking = existing
      ? this.withIncrement(existing, nickname, delta)
      : Ranking.create(id, nickname, delta);

    await this.repository.save(ranking);
  }

  private async applyScore(
    key: RankingKey,
    userId: string,
    nickname: string,
    score: number,
  ): Promise<void> {
    const id = RankingId.fromKey(key, userId);
    const existing = await this.repository.search(id);

    const ranking = existing
      ? this.withScore(existing, nickname, score)
      : Ranking.create(id, nickname, score);

    await this.repository.save(ranking);
  }

  private withIncrement(
    ranking: Ranking,
    nickname: string,
    delta: number,
  ): Ranking {
    ranking.incrementScore(delta);
    ranking.rename(nickname);
    return ranking;
  }

  private withScore(
    ranking: Ranking,
    nickname: string,
    score: number,
  ): Ranking {
    ranking.applyScore(score);
    ranking.rename(nickname);
    return ranking;
  }

  private async removeAllForUser(userId: string): Promise<void> {
    const rankings = await this.repository.match(
      new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: userId },
      ]),
    );

    for (const ranking of rankings) {
      await this.repository.remove(ranking.id);
    }
  }

  private async renameAllForUser(
    userId: string,
    nickname: string,
  ): Promise<void> {
    const rankings = await this.repository.match(
      new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: userId },
      ]),
    );

    for (const ranking of rankings) {
      ranking.rename(nickname);
      await this.repository.save(ranking);
    }
  }

  private key(type: string, period: string, module: string): RankingKey {
    return RankingKey.create(type, period, module);
  }
}
