import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type ModuleProgressRepository } from '@/progress/domain/module-progress.repository';
import { ModuleProgress } from '@/progress/domain/module-progress';
import { type UserId } from '@/shared/domain/user-id';
import { type ModuleName } from '@/progress/domain/module-name';
import { ModuleProgressEntity } from './module-progress.entity';

@Injectable()
export class TypeOrmModuleProgressRepository implements ModuleProgressRepository {
  constructor(
    @InjectRepository(ModuleProgressEntity)
    private readonly repo: Repository<ModuleProgressEntity>,
  ) {}

  async save(mp: ModuleProgress): Promise<void> {
    const p = mp.toPrimitives();
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(ModuleProgressEntity)
      .values({
        userId: p.userId,
        module: p.module,
        totalAttempts: p.totalAttempts,
        correctCount: p.correctCount,
        accuracy: p.accuracy,
        masteryLevel: p.masteryLevel,
        lastPlayedAt: new Date(p.lastPlayedAt),
        updatedAt: new Date(p.updatedAt),
      })
      .orUpdate(
        [
          'total_attempts',
          'correct_count',
          'accuracy',
          'mastery_level',
          'last_played_at',
          'updated_at',
        ],
        ['user_id', 'module'],
      )
      .execute();
  }

  async findAll(userId: UserId): Promise<ModuleProgress[]> {
    const entities = await this.repo.find({
      where: { userId: userId.value },
    });
    return entities.map(this.toDomain.bind(this));
  }

  async findByModule(
    userId: UserId,
    module: ModuleName,
  ): Promise<ModuleProgress | null> {
    const entity = await this.repo.findOneBy({
      userId: userId.value,
      module: module.value,
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: ModuleProgressEntity): ModuleProgress {
    return ModuleProgress.fromPrimitives({
      userId: entity.userId,
      module: entity.module,
      totalAttempts: entity.totalAttempts,
      correctCount: entity.correctCount,
      accuracy: Number(entity.accuracy),
      masteryLevel: entity.masteryLevel,
      lastPlayedAt: entity.lastPlayedAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    });
  }
}
