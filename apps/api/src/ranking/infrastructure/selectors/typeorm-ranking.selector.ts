import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type RankingKey } from '@/ranking/domain/ranking-key';
import { type RankingSelector } from '@/ranking/domain/ranking-selector';
import { RankingEntry } from '@/ranking/domain/ranking-entry';

@Injectable()
export class TypeOrmRankingSelector implements RankingSelector {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async selectLeaderboard(
    key: RankingKey,
    limit: number,
  ): Promise<RankingEntry[]> {
    const rows = await this.dataSource.query<
      {
        rank: string;
        user_id: string;
        nickname: string;
        score: string;
      }[]
    >(
      `SELECT
         RANK() OVER (ORDER BY score DESC, nickname ASC) AS rank,
         user_id,
         nickname,
         score
       FROM ranking_user_scores
       WHERE type = $1
         AND period = $2
         AND period_bucket = $3
         AND module = $4
         AND score > 0
       ORDER BY score DESC, nickname ASC
       LIMIT $5`,
      [key.type.value, key.period.value, key.periodBucket, key.module, limit],
    );

    return rows.map(
      (row) =>
        new RankingEntry(
          Number(row.rank),
          row.user_id,
          row.nickname,
          Number(row.score),
        ),
    );
  }

  async selectUserEntry(
    key: RankingKey,
    userId: string,
  ): Promise<RankingEntry | null> {
    const rows = await this.dataSource.query<
      {
        rank: string;
        user_id: string;
        nickname: string;
        score: string;
      }[]
    >(
      `WITH ranked AS (
         SELECT
           RANK() OVER (ORDER BY score DESC, nickname ASC) AS rank,
           user_id,
           nickname,
           score
         FROM ranking_user_scores
         WHERE type = $1
           AND period = $2
           AND period_bucket = $3
           AND module = $4
           AND score > 0
       )
       SELECT rank, user_id, nickname, score
       FROM ranked
       WHERE user_id = $5`,
      [key.type.value, key.period.value, key.periodBucket, key.module, userId],
    );

    const row = rows[0];
    if (!row) return null;

    return new RankingEntry(
      Number(row.rank),
      row.user_id,
      row.nickname,
      Number(row.score),
    );
  }
}
