import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type AudioUrlsPrimitives } from '@/content/flashcard/domain/audio-urls';
import { type ExamplePrimitives } from '@/content/flashcard/domain/example';

@Entity('flashcards')
export class FlashcardEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 255 })
  expression: string;

  @Column({ type: 'text' })
  meaning: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 100 })
  subcategory: string;

  @Column({
    name: 'ipa_notation',
    nullable: true,
    type: 'varchar',
    length: 255,
  })
  ipaNotation: string | null;

  @Column({
    name: 'native_speech',
    nullable: true,
    type: 'varchar',
    length: 255,
  })
  nativeSpeech: string | null;

  @Column({ name: 'audio_status', length: 20, default: 'pending' })
  audioStatus: string;

  @Column({ name: 'audio_urls', nullable: true, type: 'jsonb' })
  audioUrls: AudioUrlsPrimitives | null;

  @Column({ type: 'jsonb', default: '[]' })
  examples: ExamplePrimitives[];

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamptz' })
  deletedAt: Date | null;
}
