import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { UserId } from '@/shared/domain/user-id';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';
import { type UserAchievementRepository } from '@/achievement/user-achievement/domain/user-achievement.repository';
import { UserAchievementEntity } from '@/achievement/user-achievement/infrastructure/persistence/user-achievement.entity';

@Injectable()
export class TypeOrmUserAchievementRepository implements UserAchievementRepository {
  constructor(
    @InjectRepository(UserAchievementEntity)
    private readonly repo: Repository<UserAchievementEntity>,
  ) {}

  async match(criteria: Criteria): Promise<UserAchievement[]> {
    const userIdFilter = criteria.filters.find(
      (filter) =>
        filter.field === 'userId' && filter.operator === FilterOperator.EQ,
    );

    if (!userIdFilter || typeof userIdFilter.value !== 'string') {
      return [];
    }

    const entities = await this.repo.findBy({ userId: userIdFilter.value });
    return entities.map((entity) => this.toDomain(entity));
  }

  async search(
    userId: UserId,
    achievementKey: AchievementKey,
  ): Promise<UserAchievement | null> {
    const entity = await this.repo.findOneBy({
      userId: userId.value,
      achievementKey: achievementKey.value,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(achievement: UserAchievement): Promise<void> {
    await this.repo.save(this.toEntity(achievement));
  }

  async remove(userId: UserId, achievementKey: AchievementKey): Promise<void> {
    await this.repo.delete({
      userId: userId.value,
      achievementKey: achievementKey.value,
    });
  }

  private toDomain(entity: UserAchievementEntity): UserAchievement {
    return UserAchievement.fromPrimitives({
      userId: entity.userId,
      achievementKey: entity.achievementKey,
      unlockedAt: entity.unlockedAt,
    });
  }

  private toEntity(achievement: UserAchievement): UserAchievementEntity {
    const primitives = achievement.toPrimitives();
    const entity = new UserAchievementEntity();
    entity.userId = primitives.userId;
    entity.achievementKey = primitives.achievementKey;
    entity.unlockedAt = primitives.unlockedAt;
    return entity;
  }
}
