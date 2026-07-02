import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_achievements')
export class UserAchievementEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'achievement_key', length: 50 })
  achievementKey!: string;

  @Column({ name: 'unlocked_at', type: 'timestamp' })
  unlockedAt!: Date;
}
