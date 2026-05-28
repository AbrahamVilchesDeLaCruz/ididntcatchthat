import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type GameFlashcardQuery,
  type GameFlashcardDto,
  type GameFlashcardAudioUrls,
  type GameFlashcardExample,
} from '@/gaming/domain/game-flashcard-query';

interface FlashcardRow {
  id: string;
  position: number;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipa_notation: string | null;
  native_speech: string | null;
  audio_urls: GameFlashcardAudioUrls | null;
  examples: GameFlashcardExample[] | null;
}

@Injectable()
export class TypeOrmGameFlashcardQuery implements GameFlashcardQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByGameId(gameId: string): Promise<GameFlashcardDto[]> {
    const rows = await this.dataSource.query<FlashcardRow[]>(
      `SELECT
         f.id,
         gf.position,
         f.expression,
         f.meaning,
         f.category,
         f.subcategory,
         f.ipa_notation,
         f.native_speech,
         f.audio_urls,
         (
           SELECT json_agg(ex ORDER BY ex.position)
           FROM examples ex
           WHERE ex.flashcard_id = f.id
         ) AS examples
       FROM game_flashcards gf
       JOIN flashcards f ON f.id = gf.flashcard_id
       WHERE gf.game_id = $1
       ORDER BY gf.position ASC`,
      [gameId],
    );

    return rows.map((r) => ({
      id: r.id,
      position: r.position,
      expression: r.expression,
      meaning: r.meaning,
      category: r.category,
      subcategory: r.subcategory,
      ipaNotation: r.ipa_notation,
      nativeSpeech: r.native_speech,
      audioUrls: r.audio_urls,
      examples: r.examples ?? [],
    }));
  }
}
