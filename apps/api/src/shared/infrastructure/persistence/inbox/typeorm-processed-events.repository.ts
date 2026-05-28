import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type ProcessedEventsRepository } from '@/shared/domain/processed-events.repository';
import { ProcessedEventEntity } from './processed-event.entity';

@Injectable()
export class TypeOrmProcessedEventsRepository implements ProcessedEventsRepository {
  constructor(
    @InjectRepository(ProcessedEventEntity)
    private readonly repo: Repository<ProcessedEventEntity>,
  ) {}

  async exists(eventId: string, handler: string): Promise<boolean> {
    const count = await this.repo.countBy({ eventId, handler });
    return count > 0;
  }

  async save(eventId: string, handler: string): Promise<void> {
    const entity = new ProcessedEventEntity();
    entity.eventId = eventId;
    entity.handler = handler;
    entity.processedAt = new Date();
    await this.repo.save(entity);
  }
}
