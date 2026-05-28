import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { UserFlashcardStats } from '@/progress/domain/user-flashcard-stats';
import { type UserId } from '@/shared/domain/user-id';
import { type FlashcardId } from '@/shared/domain/flashcard-id';
import { type ModuleName } from '@/progress/domain/module-name';
import { UserFlashcardStatsEntity } from './user-flashcard-stats.entity';

@Injectable()
export class TypeOrmUserFlashcardStatsRepository implements UserFlashcardStatsRepository {
  constructor(
    @InjectRepository(UserFlashcardStatsEntity)
    private readonly repo: Repository<UserFlashcardStatsEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(stats: UserFlashcardStats): Promise<void> {
    await this.repo.save(this.toEntity(stats));
  }

  async search(
    userId: UserId,
    flashcardId: FlashcardId,
  ): Promise<UserFlashcardStats | null> {
    const entity = await this.repo.findOneBy({
      userId: userId.value,
      flashcardId: flashcardId.value,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findWeakest(
    userId: UserId,
    limit: number,
  ): Promise<UserFlashcardStats[]> {
    const entities = await this.repo.find({
      where: { userId: userId.value },
      order: { accuracyRate: 'ASC' },
      take: limit,
    });
    return entities.map(this.toDomain.bind(this));
  }

  async findByModule(
    userId: UserId,
    module: ModuleName,
  ): Promise<UserFlashcardStats[]> {
    const rows = await this.dataSource.query<
      {
        user_id: string;
        flashcard_id: string;
        times_studied: number;
        times_played: number;
        correct_count: number;
        accuracy_rate: string;
        last_seen_at: Date;
      }[]
    >(
      `SELECT ufs.user_id, ufs.flashcard_id, ufs.times_studied, ufs.times_played,
              ufs.correct_count, ufs.accuracy_rate, ufs.last_seen_at
       FROM user_flashcard_stats ufs
       INNER JOIN flashcards f ON f.id = ufs.flashcard_id
       WHERE ufs.user_id = $1
         AND f.category = $2`,
      [userId.value, module.value],
    );

    return rows.map((row) =>
      UserFlashcardStats.fromPrimitives({
        userId: row.user_id,
        flashcardId: row.flashcard_id,
        timesStudied: row.times_studied,
        timesPlayed: row.times_played,
        correctCount: row.correct_count,
        accuracyRate: Number(row.accuracy_rate),
        lastSeenAt: row.last_seen_at.toISOString(),
      }),
    );
  }

  private toDomain(entity: UserFlashcardStatsEntity): UserFlashcardStats {
    return UserFlashcardStats.fromPrimitives({
      userId: entity.userId,
      flashcardId: entity.flashcardId,
      timesStudied: entity.timesStudied,
      timesPlayed: entity.timesPlayed,
      correctCount: entity.correctCount,
      accuracyRate: Number(entity.accuracyRate),
      lastSeenAt: entity.lastSeenAt.toISOString(),
    });
  }

  private toEntity(stats: UserFlashcardStats): UserFlashcardStatsEntity {
    const p = stats.toPrimitives();
    const e = new UserFlashcardStatsEntity();
    e.userId = p.userId;
    e.flashcardId = p.flashcardId;
    e.timesStudied = p.timesStudied;
    e.timesPlayed = p.timesPlayed;
    e.correctCount = p.correctCount;
    e.accuracyRate = p.accuracyRate;
    e.lastSeenAt = new Date(p.lastSeenAt);
    return e;
  }
}
