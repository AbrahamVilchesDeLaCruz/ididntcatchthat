import { AggregateRoot } from '@/shared/domain/aggregate-root';
import {
  RankingId,
  type RankingIdPrimitives,
} from '@/ranking/projection/domain/ranking-id';

export type RankingScorePrimitives = RankingIdPrimitives & {
  nickname: string;
  score: number;
};

/** Projection row in `ranking_user_scores` — one score per user and ranking dimension. */
export class RankingScore extends AggregateRoot<RankingScorePrimitives> {
  private constructor(
    readonly id: RankingId,
    private _nickname: string,
    private _score: number,
  ) {
    super();
  }

  get nickname(): string {
    return this._nickname;
  }

  get score(): number {
    return this._score;
  }

  static create(id: RankingId, nickname: string, score: number): RankingScore {
    return new RankingScore(id, nickname, score);
  }

  static fromPrimitives(p: RankingScorePrimitives): RankingScore {
    return new RankingScore(RankingId.fromPrimitives(p), p.nickname, p.score);
  }

  incrementScore(delta: number): void {
    this._score += delta;
  }

  applyScore(score: number): void {
    this._score = score;
  }

  rename(nickname: string): void {
    this._nickname = nickname;
  }

  toPrimitives(): RankingScorePrimitives {
    return {
      ...this.id.toPrimitives(),
      nickname: this._nickname,
      score: this._score,
    };
  }
}
