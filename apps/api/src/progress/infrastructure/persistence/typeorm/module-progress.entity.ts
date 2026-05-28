import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('module_progress')
export class ModuleProgressEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'module', type: 'varchar', length: 100 })
  module: string;

  @Column({ name: 'total_attempts', type: 'int', default: 0 })
  totalAttempts: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({
    name: 'accuracy',
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0,
  })
  accuracy: number;

  @Column({ name: 'mastery_level', type: 'smallint', default: 0 })
  masteryLevel: number;

  @Column({ name: 'last_played_at', type: 'timestamp' })
  lastPlayedAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
