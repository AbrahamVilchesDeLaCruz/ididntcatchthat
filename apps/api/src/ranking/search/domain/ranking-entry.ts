export type RankingEntryPrimitives = {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
};

export class RankingEntry {
  constructor(
    readonly rank: number,
    readonly userId: string,
    readonly nickname: string,
    readonly score: number,
  ) {}

  toPrimitives(): RankingEntryPrimitives {
    return {
      rank: this.rank,
      userId: this.userId,
      nickname: this.nickname,
      score: this.score,
    };
  }
}
