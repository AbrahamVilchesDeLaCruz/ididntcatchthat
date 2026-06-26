import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type FlashcardSelector } from '@/gaming/domain/flashcard-selector';
import { type GameModule } from '@/gaming/domain/game-module';

@Injectable()
export class TypeOrmFlashcardSelector implements FlashcardSelector {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async select(
    module: GameModule | null,
    subcategory: string | null,
    count: number,
  ): Promise<string[]> {
    const params: (string | number)[] = ['ready', count];
    let categoryClause = '';
    let subcategoryClause = '';

    if (module !== null) {
      params.push(module.value);
      categoryClause = `AND category = $${params.length}`;
    }

    if (subcategory !== null) {
      params.push(subcategory);
      subcategoryClause = `AND subcategory = $${params.length}`;
    }

    const rows = await this.dataSource.query<{ id: string }[]>(
      `SELECT id
       FROM flashcards
       WHERE audio_status = $1
       ${categoryClause}
       ${subcategoryClause}
       ORDER BY RANDOM()
       LIMIT $2`,
      params,
    );

    return rows.map((r) => r.id);
  }
}
