import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type WeakestFlashcardDto,
  type WeakestFlashcardQuery,
} from '@/progress/domain/weakest-flashcard.query';
import { type UserId } from '@/shared/domain/user-id';

interface WeakestFlashcardRow {
  flashcard_id: string;
  expression: string;
  category: string;
  subcategory: string;
  error_count: number;
  last_seen_at: Date;
}

@Injectable()
export class TypeOrmWeakestFlashcardQuery implements WeakestFlashcardQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findWeakest(
    userId: UserId,
    limit: number,
  ): Promise<WeakestFlashcardDto[]> {
    const rows = await this.dataSource.query<WeakestFlashcardRow[]>(
      `SELECT
         ufs.flashcard_id,
         f.expression,
         f.category,
         f.subcategory,
         (ufs.times_played - ufs.correct_count) AS error_count,
         ufs.last_seen_at
       FROM user_flashcard_stats ufs
       JOIN flashcards f ON f.id = ufs.flashcard_id
       WHERE ufs.user_id = $1
         AND ufs.times_played > 0
       ORDER BY error_count DESC, ufs.accuracy_rate ASC
       LIMIT $2`,
      [userId.value, limit],
    );

    return rows.map((row) => ({
      flashcardId: row.flashcard_id,
      expression: row.expression,
      module: row.category,
      category: row.category,
      subcategory: row.subcategory,
      errorCount: Number(row.error_count),
      lastSeenAt: row.last_seen_at.toISOString(),
    }));
  }
}
