import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { UserId } from '@/shared/domain/user-id';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { type UserAchievementProgressRepository } from '@/achievement/progress/domain/user-achievement-progress.repository';
import { UserAchievementProgressEntity } from '@/achievement/progress/infrastructure/persistence/user-achievement-progress.entity';

@Injectable()
export class TypeOrmUserAchievementProgressRepository implements UserAchievementProgressRepository {
  constructor(
    @InjectRepository(UserAchievementProgressEntity)
    private readonly repository: Repository<UserAchievementProgressEntity>,
  ) {}

  async match(criteria: Criteria): Promise<UserAchievementProgress[]> {
    const userIdFilter = criteria.filters.find(
      (filter) =>
        filter.field === 'userId' && filter.operator === FilterOperator.EQ,
    );

    if (!userIdFilter || typeof userIdFilter.value !== 'string') {
      return [];
    }

    const entity = await this.repository.findOneBy({
      userId: userIdFilter.value,
    });

    return entity ? [this.toDomain(entity)] : [];
  }

  async search(userId: UserId): Promise<UserAchievementProgress | null> {
    const row = await this.repository.findOneBy({ userId: userId.value });
    return row ? this.toDomain(row) : null;
  }

  async save(progress: UserAchievementProgress): Promise<void> {
    await this.repository.save(this.toEntity(progress));
  }

  async remove(userId: UserId): Promise<void> {
    await this.repository.delete({ userId: userId.value });
  }

  private toDomain(
    entity: UserAchievementProgressEntity,
  ): UserAchievementProgress {
    return UserAchievementProgress.fromPrimitives({
      userId: entity.userId,
      completedGamesCount: entity.completedGamesCount,
      completedStudySessionsCount: entity.completedStudySessionsCount,
      totalPlayedAttempts: entity.totalPlayedAttempts,
      touchedModules: entity.touchedModules,
    });
  }

  private toEntity(
    progress: UserAchievementProgress,
  ): UserAchievementProgressEntity {
    const primitives = progress.toPrimitives();
    return {
      userId: primitives.userId,
      completedGamesCount: primitives.completedGamesCount,
      completedStudySessionsCount: primitives.completedStudySessionsCount,
      totalPlayedAttempts: primitives.totalPlayedAttempts,
      touchedModules: primitives.touchedModules,
    };
  }
}
