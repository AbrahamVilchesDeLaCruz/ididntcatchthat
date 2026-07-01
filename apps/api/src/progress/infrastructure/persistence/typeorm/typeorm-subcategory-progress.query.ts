import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type SubcategoryProgress,
  type SubcategoryProgressQuery,
} from '@/progress/domain/subcategory-progress.query';
import { type UserId } from '@/shared/domain/user-id';

interface SubcategoryProgressRow {
  category: string;
  subcategory: string;
  total_attempts: string;
  correct_count: string;
}

@Injectable()
export class TypeOrmSubcategoryProgressQuery implements SubcategoryProgressQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByUser(userId: UserId): Promise<SubcategoryProgress[]> {
    const rows = await this.dataSource.query<SubcategoryProgressRow[]>(
      `SELECT
         f.category,
         f.subcategory,
         SUM(ufs.times_played)::int AS total_attempts,
         SUM(ufs.correct_count)::int AS correct_count
       FROM user_flashcard_stats ufs
       INNER JOIN flashcards f ON f.id = ufs.flashcard_id
       WHERE ufs.user_id = $1
       GROUP BY f.category, f.subcategory
       HAVING SUM(ufs.times_played) > 0
       ORDER BY f.category ASC, f.subcategory ASC`,
      [userId.value],
    );

    return rows.map((row) => {
      const totalAttempts = Number(row.total_attempts);
      const correctCount = Number(row.correct_count);
      return {
        category: row.category,
        subcategory: row.subcategory,
        totalAttempts,
        correctCount,
        accuracy: totalAttempts === 0 ? 0 : correctCount / totalAttempts,
      };
    });
  }
}
