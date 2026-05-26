import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '@/gaming/domain/game';
import { GameId } from '@/gaming/domain/game-id';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type Criteria } from '@/shared/domain/criteria';
import { GameEntity } from './game.entity';
import { AttemptEntity } from './attempt.entity';
import { GameFlashcardEntity } from './game-flashcard.entity';

@Injectable()
export class TypeOrmGameRepository implements GameRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,
    @InjectRepository(AttemptEntity)
    private readonly attemptRepo: Repository<AttemptEntity>,
    @InjectRepository(GameFlashcardEntity)
    private readonly flashcardRepo: Repository<GameFlashcardEntity>,
  ) {}

  async search(id: GameId): Promise<Game | null> {
    const entity = await this.gameRepo.findOneBy({ id: id.value });
    if (!entity) return null;

    const attempts = await this.attemptRepo.findBy({ gameId: id.value });
    const gameFlashcards = await this.flashcardRepo.find({
      where: { gameId: id.value },
      order: { position: 'ASC' },
    });

    return this.toDomain(entity, attempts, gameFlashcards);
  }

  async save(game: Game): Promise<void> {
    const p = game.toPrimitives();

    const gameEntity = this.toGameEntity(p);
    await this.gameRepo.save(gameEntity);

    if (p.attempts.length > 0) {
      await this.attemptRepo.delete({ gameId: p.id });
      const attemptEntities = p.attempts.map((a) => {
        const e = new AttemptEntity();
        e.id = a.id;
        e.gameId = a.gameId;
        e.flashcardId = a.flashcardId;
        e.correct = a.correct;
        e.answeredAt = a.answeredAt;
        return e;
      });
      await this.attemptRepo.save(attemptEntities);
    }

    await this.flashcardRepo.delete({ gameId: p.id });
    if (p.flashcardIds.length > 0) {
      const flashcardEntities = p.flashcardIds.map((flashcardId, position) => {
        const e = new GameFlashcardEntity();
        e.gameId = p.id;
        e.flashcardId = flashcardId;
        e.position = position;
        return e;
      });
      await this.flashcardRepo.save(flashcardEntities);
    }
  }

  async match(criteria: Criteria): Promise<Game[]> {
    const qb = this.gameRepo.createQueryBuilder('g');

    for (const filter of criteria.filters) {
      const param = `p_${filter.field}`;
      if (filter.value === null) {
        if (filter.operator === '=') {
          qb.andWhere(`g.${filter.field} IS NULL`);
        } else {
          qb.andWhere(`g.${filter.field} IS NOT NULL`);
        }
      } else {
        qb.andWhere(`g.${filter.field} ${filter.operator} :${param}`, {
          [param]: filter.value,
        });
      }
    }

    if (criteria.order) {
      qb.orderBy(`g.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e, [], []));
  }

  private toDomain(
    entity: GameEntity,
    attempts: AttemptEntity[],
    gameFlashcards: GameFlashcardEntity[],
  ): Game {
    return Game.fromPrimitives({
      id: entity.id,
      userId: entity.userId,
      mode: entity.mode,
      module: entity.module,
      cardCount: entity.cardCount,
      status: entity.status,
      flashcardIds: gameFlashcards.map((gf) => gf.flashcardId),
      lastFlashcardId: entity.lastFlashcardId,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      attempts: attempts.map((a) => ({
        id: a.id,
        gameId: a.gameId,
        flashcardId: a.flashcardId,
        correct: a.correct,
        answeredAt: a.answeredAt,
      })),
    });
  }

  private toGameEntity(p: ReturnType<Game['toPrimitives']>): GameEntity {
    const e = new GameEntity();
    e.id = p.id;
    e.userId = p.userId;
    e.mode = p.mode;
    e.module = p.module;
    e.cardCount = p.cardCount;
    e.status = p.status;
    e.lastFlashcardId = p.lastFlashcardId;
    e.startedAt = p.startedAt;
    e.finishedAt = p.finishedAt;
    return e;
  }
}
