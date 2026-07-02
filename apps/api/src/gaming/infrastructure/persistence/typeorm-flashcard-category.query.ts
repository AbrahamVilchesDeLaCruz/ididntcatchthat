import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type FlashcardCategoryQuery } from '@/gaming/domain/flashcard-category.query';

@Injectable()
export class TypeOrmFlashcardCategoryQuery implements FlashcardCategoryQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findCategoryByFlashcardId(flashcardId: string): Promise<string | null> {
    const rows = await this.dataSource.query<{ category: string }[]>(
      `SELECT category FROM flashcards WHERE id = $1 LIMIT 1`,
      [flashcardId],
    );
    return rows[0]?.category ?? null;
  }
}
