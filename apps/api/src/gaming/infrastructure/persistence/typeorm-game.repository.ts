import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '@/gaming/domain/game';
import { GameId } from '@/gaming/domain/game-id';
import { type GameRepository } from '@/gaming/domain/game.repository';
import {
  type AttemptRepository,
  ATTEMPT_REPOSITORY,
} from '@/gaming/domain/attempt.repository';
import {
  type ViewRepository,
  VIEW_REPOSITORY,
} from '@/gaming/domain/view.repository';
import { type Criteria, FilterOperator } from '@/shared/domain/criteria';
import { GameEntity } from './game.entity';
import { GameFlashcardEntity } from './game-flashcard.entity';

@Injectable()
export class TypeOrmGameRepository implements GameRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,
    @InjectRepository(GameFlashcardEntity)
    private readonly flashcardRepo: Repository<GameFlashcardEntity>,
    @Inject(ATTEMPT_REPOSITORY)
    private readonly attemptRepository: AttemptRepository,
    @Inject(VIEW_REPOSITORY)
    private readonly viewRepository: ViewRepository,
  ) {}

  async search(id: GameId): Promise<Game | null> {
    const entity = await this.gameRepo.findOneBy({ id: id.value });
    if (!entity) return null;

    const attempts = await this.attemptRepository.findByGameId(id.value);
    const views = await this.viewRepository.findByGameId(id.value);
    const gameFlashcards = await this.flashcardRepo.find({
      where: { gameId: id.value },
      order: { position: 'ASC' },
    });

    return Game.fromPrimitives({
      id: entity.id,
      userId: entity.userId,
      mode: entity.mode,
      module: entity.module,
      subcategory: entity.subcategory,
      source: entity.source ?? 'catalog',
      cardCount: entity.cardCount,
      status: entity.status,
      flashcardIds: gameFlashcards.map((gf) => gf.flashcardId),
      lastFlashcardId: entity.lastFlashcardId,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      attempts: attempts.map((a) => a.toPrimitives()),
      views: views.map((v) => v.toPrimitives()),
    });
  }

  async save(game: Game): Promise<void> {
    const p = game.toPrimitives();

    const gameEntity = this.toGameEntity(p);
    await this.gameRepo.save(gameEntity);

    // GameFlashcards are persisted only on create (the set never changes during a game)
    const existingCount = await this.flashcardRepo.countBy({ gameId: p.id });
    if (existingCount === 0 && p.flashcardIds.length > 0) {
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
        if (filter.operator === FilterOperator.EQ) {
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
    return entities.map((e) =>
      Game.fromPrimitives({
        id: e.id,
        userId: e.userId,
        mode: e.mode,
        module: e.module,
        subcategory: e.subcategory,
        source: e.source ?? 'catalog',
        cardCount: e.cardCount,
        status: e.status,
        flashcardIds: [],
        lastFlashcardId: e.lastFlashcardId,
        startedAt: e.startedAt,
        finishedAt: e.finishedAt,
        attempts: [],
        views: [],
      }),
    );
  }

  private toGameEntity(p: ReturnType<Game['toPrimitives']>): GameEntity {
    const e = new GameEntity();
    e.id = p.id;
    e.userId = p.userId;
    e.mode = p.mode;
    e.module = p.module;
    e.subcategory = p.subcategory;
    e.source = p.source;
    e.cardCount = p.cardCount;
    e.status = p.status;
    e.lastFlashcardId = p.lastFlashcardId;
    e.startedAt = p.startedAt;
    e.finishedAt = p.finishedAt;
    return e;
  }
}
