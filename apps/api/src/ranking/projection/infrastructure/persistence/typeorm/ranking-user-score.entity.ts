import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('ranking_user_scores')
export class RankingUserScoreEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ length: 50 })
  type: string;

  @PrimaryColumn({ length: 20 })
  period: string;

  @PrimaryColumn({ name: 'period_bucket', length: 20 })
  periodBucket: string;

  @PrimaryColumn({ length: 100 })
  module: string;

  @Column({ length: 30 })
  nickname: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  score: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
