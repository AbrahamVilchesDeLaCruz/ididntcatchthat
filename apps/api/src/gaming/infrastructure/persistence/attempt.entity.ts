import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('attempts')
export class AttemptEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'game_id', type: 'uuid' })
  gameId: string;

  @Column({ name: 'flashcard_id', type: 'uuid' })
  flashcardId: string;

  @Column()
  correct: boolean;

  @Column({ name: 'answered_at', type: 'timestamp' })
  answeredAt: Date;
}
