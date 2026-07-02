# Repository Patterns — Reference

## TypeORM Repository completo con Criteria

```typescript
// gaming/infrastructure/persistence/typeorm-game.repository.ts
@Injectable()
export class TypeOrmGameRepository implements GameRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,
  ) {}

  async search(id: GameId): Promise<Game | null> {
    const entity = await this.gameRepo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
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
    return entities.map((e) => this.toDomain(e));
  }

  async save(game: Game): Promise<void> {
    await this.gameRepo.save(this.toEntity(game));
  }

  async remove(id: GameId): Promise<void> {
    await this.gameRepo.delete({ id: id.value });
  }

  private toDomain(entity: GameEntity): Game {
    return Game.fromPrimitives({
      id: entity.id,
      userId: entity.userId,
      mode: entity.mode,
      module: entity.module,
      subcategory: entity.subcategory,
      source: entity.source ?? 'catalog',
      cardCount: entity.cardCount,
      status: entity.status,
      lastFlashcardId: entity.lastFlashcardId,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
    });
  }

  private toEntity(game: Game): GameEntity {
    const e = new GameEntity();
    const p = game.toPrimitives();
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
```

## TypeORM Entity completa

```typescript
// gaming/infrastructure/persistence/game.entity.ts
@Entity('games')
export class GameEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true, type: 'uuid' })
  userId: string | null;

  @Column()
  mode: string;

  @Column({ nullable: true })
  module: string | null;

  @Column({ nullable: true })
  subcategory: string | null;

  @Column({ default: 'catalog' })
  source: string;

  @Column({ name: 'card_count' })
  cardCount: string;

  @Column({ default: 'in_progress' })
  status: string;

  @Column({ name: 'last_flashcard_id', nullable: true })
  lastFlashcardId: string | null;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date | null;
}
```

## Módulo NestJS

```typescript
// gaming/infrastructure/framework/gaming.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([GameEntity])],
  controllers: [
    StartGamePostController,
    CompleteGamePostController,
    AbandonGamePostController,
    PauseGamePostController,
    ResumeGamePostController,
    FindGameSummaryGetController,
  ],
  providers: [
    GameStarter,
    GameCompleter,
    GameAbandonner,
    GamePauser,
    GameResumer,
    GameSummaryFinder,
    GamingExceptionRegistry,
    {
      provide: GAME_REPOSITORY,
      useClass: TypeOrmGameRepository,
    },
  ],
})
export class GamingModule {}
```
