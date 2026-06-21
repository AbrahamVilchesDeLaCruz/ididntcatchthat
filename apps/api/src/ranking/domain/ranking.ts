import { AggregateRoot } from '@/shared/domain/aggregate-root';
import {
  RankingId,
  type RankingIdPrimitives,
} from '@/ranking/domain/ranking-id';

export type RankingPrimitives = RankingIdPrimitives & {
  nickname: string;
  score: number;
};

export class Ranking extends AggregateRoot<RankingPrimitives> {
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

  static create(id: RankingId, nickname: string, score: number): Ranking {
    return new Ranking(id, nickname, score);
  }

  static fromPrimitives(p: RankingPrimitives): Ranking {
    return new Ranking(RankingId.fromPrimitives(p), p.nickname, p.score);
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

  toPrimitives(): RankingPrimitives {
    return {
      ...this.id.toPrimitives(),
      nickname: this._nickname,
      score: this._score,
    };
  }
}
