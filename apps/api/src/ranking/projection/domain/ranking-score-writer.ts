import { Inject, Injectable } from '@nestjs/common';
import {
  RankingKey,
  GLOBAL_MODULE_SCOPE,
} from '@/ranking/shared/domain/ranking-key';
import { RankingScore } from '@/ranking/projection/domain/ranking-score';
import { RankingId } from '@/ranking/projection/domain/ranking-id';
import {
  type RankingScoreRepository,
  RANKING_SCORE_REPOSITORY,
} from '@/ranking/projection/domain/ranking-score.repository';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { RankingPeriodBucket } from '@/ranking/shared/domain/ranking-period-bucket';

@Injectable()
export class RankingScoreWriter {
  constructor(
    @Inject(RANKING_SCORE_REPOSITORY)
    private readonly repository: RankingScoreRepository,
  ) {}

  async incrementScore(
    key: RankingKey,
    userId: string,
    nickname: string,
    delta: number,
  ): Promise<void> {
    const id = RankingId.fromKey(key, userId);
    const existing = await this.repository.search(id);

    const score = existing
      ? this.withIncrement(existing, nickname, delta)
      : RankingScore.create(id, nickname, delta);

    await this.repository.save(score);
  }

  async applyScore(
    key: RankingKey,
    userId: string,
    nickname: string,
    value: number,
  ): Promise<void> {
    const id = RankingId.fromKey(key, userId);
    const existing = await this.repository.search(id);

    const score = existing
      ? this.withScore(existing, nickname, value)
      : RankingScore.create(id, nickname, value);

    await this.repository.save(score);
  }

  async removeAllForUser(userId: string): Promise<void> {
    const scores = await this.repository.match(
      new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: userId },
      ]),
    );

    for (const score of scores) {
      await this.repository.remove(score.id);
    }
  }

  async renameAllForUser(userId: string, nickname: string): Promise<void> {
    const scores = await this.repository.match(
      new Criteria([
        { field: 'userId', operator: FilterOperator.EQ, value: userId },
      ]),
    );

    for (const score of scores) {
      score.rename(nickname);
      await this.repository.save(score);
    }
  }

  key(
    type: string,
    period: string,
    module: string = GLOBAL_MODULE_SCOPE,
  ): RankingKey {
    return RankingKey.create(type, period, module);
  }

  allPeriods(): ReturnType<typeof RankingPeriodBucket.allPeriods> {
    return RankingPeriodBucket.allPeriods();
  }

  sinceDate(period: string, at: Date): Date | null {
    return RankingPeriodBucket.sinceDate(period, at);
  }

  private withIncrement(
    score: RankingScore,
    nickname: string,
    delta: number,
  ): RankingScore {
    score.incrementScore(delta);
    score.rename(nickname);
    return score;
  }

  private withScore(
    score: RankingScore,
    nickname: string,
    value: number,
  ): RankingScore {
    score.applyScore(value);
    score.rename(nickname);
    return score;
  }
}
