import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_views')
export class ViewEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'game_id', type: 'uuid' })
  gameId: string;

  @Column({ name: 'flashcard_id', type: 'uuid' })
  flashcardId: string;

  @Column({ name: 'viewed_at', type: 'timestamp' })
  viewedAt: Date;
}
