import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type UserStreakQuery,
  type UserStreakSnapshot,
} from '@/identity/user/domain/user-streak.query';
import { type UserId } from '@/shared/domain/user-id';

interface StreakRow {
  current_streak: number;
  longest_streak: number;
}

@Injectable()
export class TypeOrmUserStreakQuery implements UserStreakQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByUserId(userId: UserId): Promise<UserStreakSnapshot | null> {
    const rows = await this.dataSource.query<StreakRow[]>(
      `SELECT current_streak, longest_streak
       FROM users
       WHERE id = $1`,
      [userId.value],
    );

    const row = rows[0];
    if (!row) return null;

    return {
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
    };
  }
}
