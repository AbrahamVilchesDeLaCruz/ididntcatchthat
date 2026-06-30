import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type TotalAttemptsQuery } from '@/achievement/domain/total-attempts.query';
import { type UserId } from '@/shared/domain/user-id';

@Injectable()
export class TypeOrmTotalAttemptsQuery implements TotalAttemptsQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getTotalAttempts(userId: UserId): Promise<number> {
    const rows = await this.dataSource.query<{ total: string }[]>(
      `SELECT COALESCE(SUM(times_played), 0)::int AS total
       FROM user_flashcard_stats
       WHERE user_id = $1`,
      [userId.value],
    );
    return Number(rows[0]?.total ?? 0);
  }
}
