import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_achievement_progress')
export class UserAchievementProgressEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'completed_games_count', type: 'int', default: 0 })
  completedGamesCount: number;

  @Column({ name: 'completed_study_sessions_count', type: 'int', default: 0 })
  completedStudySessionsCount: number;

  @Column({ name: 'total_played_attempts', type: 'int', default: 0 })
  totalPlayedAttempts: number;

  @Column({ name: 'touched_modules', type: 'jsonb', default: () => "'[]'" })
  touchedModules: string[];
}
