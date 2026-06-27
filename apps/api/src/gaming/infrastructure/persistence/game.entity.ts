import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('games')
export class GameEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ length: 20 })
  mode: string;

  @Column({ length: 50, nullable: true, type: 'varchar' })
  module: string | null;

  @Column({ length: 100, nullable: true, type: 'varchar' })
  subcategory: string | null;

  @Column({ length: 20, default: 'catalog' })
  source: string;

  @Column({ name: 'card_count', length: 5 })
  cardCount: string;

  @Column({ length: 20, default: 'in_progress' })
  status: string;

  @Column({ name: 'last_flashcard_id', type: 'uuid', nullable: true })
  lastFlashcardId: string | null;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt: Date | null;
}
