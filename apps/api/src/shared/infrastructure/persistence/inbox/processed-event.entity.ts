import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEventEntity {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @PrimaryColumn({ name: 'handler', type: 'varchar', length: 255 })
  handler: string;

  @Column({ name: 'processed_at', type: 'timestamp' })
  processedAt: Date;
}
