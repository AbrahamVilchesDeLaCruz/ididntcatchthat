import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_flashcards')
export class GameFlashcardEntity {
  @PrimaryColumn({ name: 'game_id', type: 'uuid' })
  gameId: string;

  @PrimaryColumn({ type: 'int' })
  position: number;

  @Column({ name: 'flashcard_id', type: 'uuid' })
  flashcardId: string;
}
