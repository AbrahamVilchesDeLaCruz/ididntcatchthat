import { Inject, Injectable } from '@nestjs/common';
import {
  Criteria,
  FilterOperator,
  type Filter,
} from '@/shared/domain/criteria';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type RequestFlashcardAudioBulkRegenerator } from './request-flashcard-audio-bulk-regenerator';
import { type ResponseFlashcardAudioBulkRegenerator } from './response-flashcard-audio-bulk-regenerator';

export type { RequestFlashcardAudioBulkRegenerator } from './request-flashcard-audio-bulk-regenerator';
export type { ResponseFlashcardAudioBulkRegenerator } from './response-flashcard-audio-bulk-regenerator';

@Injectable()
export class FlashcardAudioBulkRegenerator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestFlashcardAudioBulkRegenerator,
  ): Promise<ResponseFlashcardAudioBulkRegenerator> {
    const filters: Filter[] = [
      {
        field: 'audioStatus',
        operator: FilterOperator.EQ,
        value: request.audioStatus,
      },
    ];

    if (request.category) {
      filters.push({
        field: 'category',
        operator: FilterOperator.EQ,
        value: request.category,
      });
    }

    if (request.subcategory) {
      filters.push({
        field: 'subcategory',
        operator: FilterOperator.EQ,
        value: request.subcategory,
      });
    }

    const criteria = new Criteria(
      filters,
      null,
      request.pageSize,
      (request.page - 1) * request.pageSize,
    );
    const flashcards = await this.repository.match(criteria);

    const events: DomainEvent[] = [];
    let triggered = 0;
    for (const flashcard of flashcards) {
      if (!flashcard.audioStatus.canRegenerateAudio()) continue;
      flashcard.markAudioRegenerationRequested();
      events.push(...flashcard.pullDomainEvents());
      await this.repository.save(flashcard);
      triggered += 1;
    }

    if (events.length > 0) {
      await this.publisher.publish(events);
    }

    this.logger.info('Flashcard audio bulk regeneration requested', {
      audioStatus: request.audioStatus,
      category: request.category ?? null,
      subcategory: request.subcategory ?? null,
      page: request.page,
      pageSize: request.pageSize,
      matched: flashcards.length,
      triggered,
    });

    return { triggered };
  }
}
