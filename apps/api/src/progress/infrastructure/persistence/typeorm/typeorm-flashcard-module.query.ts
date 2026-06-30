import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type FlashcardModuleQuery } from '@/progress/domain/flashcard-module.query';

interface FlashcardModuleRow {
  category: string | null;
}

@Injectable()
export class TypeOrmFlashcardModuleQuery implements FlashcardModuleQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getModule(flashcardId: string): Promise<string | null> {
    const rows = await this.dataSource.query<FlashcardModuleRow[]>(
      `SELECT category FROM flashcards WHERE id = $1 LIMIT 1`,
      [flashcardId],
    );

    return rows[0]?.category ?? null;
  }
}
