import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type WeakestFlashcard,
  type WeakestFlashcardFilters,
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

interface WeakestFlashcardCountRow {
  total: string;
}

@Injectable()
export class TypeOrmWeakestFlashcardQuery implements WeakestFlashcardQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findWeakest(
    userId: UserId,
    filters: WeakestFlashcardFilters | undefined,
    limit: number,
    offset: number,
  ): Promise<WeakestFlashcard[]> {
    const params: unknown[] = [userId.value];
    const conditions = [
      'ufs.user_id = $1',
      'ufs.times_played > 0',
      // Net errors: cards que el usuario ha fallado MÁS veces de las que ha acertado.
      // Cuando `correct_count >= wrong_count` (es decir, `(times_played - 2*correct_count) <= 0`),
      // la card sale de la lista de "más difíciles" — el aprendizaje la ha "rescatado".
      '(ufs.times_played - 2*ufs.correct_count) > 0',
    ];

    if (filters?.module) {
      params.push(filters.module);
      conditions.push(`f.category = $${params.length}`);
    }
    if (filters?.subcategory) {
      params.push(filters.subcategory);
      conditions.push(`f.subcategory = $${params.length}`);
    }

    params.push(limit, offset);
    const limitParam = `$${params.length - 1}`;
    const offsetParam = `$${params.length}`;

    const rows = await this.dataSource.query<WeakestFlashcardRow[]>(
      `SELECT
         ufs.flashcard_id,
         f.expression,
         f.category,
         f.subcategory,
         GREATEST(0, ufs.times_played - 2*ufs.correct_count) AS error_count,
         ufs.last_seen_at
       FROM user_flashcard_stats ufs
       JOIN flashcards f ON f.id = ufs.flashcard_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY (ufs.times_played - 2*ufs.correct_count) DESC, ufs.accuracy_rate ASC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params,
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

  async countWeakest(
    userId: UserId,
    filters: WeakestFlashcardFilters | undefined,
  ): Promise<number> {
    const params: unknown[] = [userId.value];
    const conditions = [
      'ufs.user_id = $1',
      'ufs.times_played > 0',
      '(ufs.times_played - 2*ufs.correct_count) > 0',
    ];

    if (filters?.module) {
      params.push(filters.module);
      conditions.push(`f.category = $${params.length}`);
    }
    if (filters?.subcategory) {
      params.push(filters.subcategory);
      conditions.push(`f.subcategory = $${params.length}`);
    }

    const rows = await this.dataSource.query<WeakestFlashcardCountRow[]>(
      `SELECT COUNT(*)::text AS total
       FROM user_flashcard_stats ufs
       JOIN flashcards f ON f.id = ufs.flashcard_id
       WHERE ${conditions.join(' AND ')}`,
      params,
    );

    return Number(rows[0]?.total ?? '0');
  }
}
