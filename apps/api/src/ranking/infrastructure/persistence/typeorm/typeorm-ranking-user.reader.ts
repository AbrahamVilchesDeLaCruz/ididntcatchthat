import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type RankingEligibleUser,
  type RankingUserReader,
} from '@/ranking/domain/ranking-user.reader';

@Injectable()
export class TypeOrmRankingUserReader implements RankingUserReader {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findEligibleUser(userId: string): Promise<RankingEligibleUser | null> {
    const [row] = await this.dataSource.query<
      { nickname: string; current_streak: string; show_in_ranking: boolean }[]
    >(
      `SELECT nickname, current_streak::text, show_in_ranking
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (!row?.show_in_ranking) return null;

    return {
      nickname: row.nickname,
      currentStreak: Number(row.current_streak),
    };
  }
}
