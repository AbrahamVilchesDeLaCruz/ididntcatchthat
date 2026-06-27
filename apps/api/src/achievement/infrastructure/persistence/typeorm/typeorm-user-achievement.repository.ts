import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAchievement } from '@/achievement/domain/user-achievement';
import { type UserAchievementRepository } from '@/achievement/domain/user-achievement.repository';
import { UserId } from '@/shared/domain/user-id';
import { UserAchievementEntity } from './user-achievement.entity';

@Injectable()
export class TypeOrmUserAchievementRepository implements UserAchievementRepository {
  constructor(
    @InjectRepository(UserAchievementEntity)
    private readonly repo: Repository<UserAchievementEntity>,
  ) {}

  async findByUserId(userId: UserId): Promise<UserAchievement[]> {
    const entities = await this.repo.findBy({ userId: userId.value });
    return entities.map((e) =>
      UserAchievement.fromPrimitives({
        userId: e.userId,
        achievementKey: e.achievementKey,
        unlockedAt: e.unlockedAt,
      }),
    );
  }

  async save(achievement: UserAchievement): Promise<void> {
    const p = achievement.toPrimitives();
    const entity = new UserAchievementEntity();
    entity.userId = p.userId;
    entity.achievementKey = p.achievementKey;
    entity.unlockedAt = p.unlockedAt;
    await this.repo.save(entity);
  }
}
