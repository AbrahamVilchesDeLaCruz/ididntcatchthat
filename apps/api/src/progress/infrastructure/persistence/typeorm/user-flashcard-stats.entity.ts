import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_flashcard_stats')
export class UserFlashcardStatsEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'flashcard_id', type: 'uuid' })
  flashcardId: string;

  @Column({ name: 'times_studied', type: 'int', default: 0 })
  timesStudied: number;

  @Column({ name: 'times_played', type: 'int', default: 0 })
  timesPlayed: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({
    name: 'accuracy_rate',
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0,
  })
  accuracyRate: number;

  @Column({ name: 'last_seen_at', type: 'timestamp' })
  lastSeenAt: Date;
}
