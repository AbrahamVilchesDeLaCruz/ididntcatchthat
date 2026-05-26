import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameFlashcardEntity } from '@/gaming/infrastructure/persistence/game-flashcard.entity';
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';
import {
  type GameFlashcardQuery,
  type GameFlashcardDto,
} from '@/gaming/domain/game-flashcard-query';

@Injectable()
export class TypeOrmGameFlashcardQuery implements GameFlashcardQuery {
  constructor(
    @InjectRepository(GameFlashcardEntity)
    private readonly gameFcRepo: Repository<GameFlashcardEntity>,
    @InjectRepository(FlashcardEntity)
    private readonly flashcardRepo: Repository<FlashcardEntity>,
  ) {}

  async findByGameId(gameId: string): Promise<GameFlashcardDto[]> {
    const gameFlashcards = await this.gameFcRepo.find({
      where: { gameId },
      order: { position: 'ASC' },
    });

    if (gameFlashcards.length === 0) return [];

    const flashcardIds = gameFlashcards.map((gf) => gf.flashcardId);
    const flashcards = await this.flashcardRepo
      .createQueryBuilder('f')
      .where('f.id IN (:...ids)', { ids: flashcardIds })
      .getMany();

    const flashcardMap = new Map(flashcards.map((f) => [f.id, f]));

    return gameFlashcards
      .map((gf) => {
        const f = flashcardMap.get(gf.flashcardId);
        if (!f) return null;
        return {
          id: f.id,
          position: gf.position,
          expression: f.expression,
          meaning: f.meaning,
          category: f.category,
          subcategory: f.subcategory,
          ipaNotation: f.ipaNotation,
          nativeSpeech: f.nativeSpeech,
          audioUrls: f.audioUrls,
          examples: f.examples,
        };
      })
      .filter((f): f is GameFlashcardDto => f !== null);
  }
}
