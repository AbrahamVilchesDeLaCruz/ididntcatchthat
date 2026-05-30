import { Inject, Injectable } from '@nestjs/common';
import { Flashcard } from '@/content/flashcard/domain/flashcard';
import { BulkEmptyFlashcards } from '@/content/flashcard/domain/exceptions/bulk-empty-flashcards';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import {
  type RequestFlashcardBulkCreator,
  type RequestFlashcardBulkCreatorItem,
} from './request-flashcard-bulk-creator';
import { type FlashcardBulkCreatorResult } from './response-flashcard-bulk-creator';

export type {
  RequestFlashcardBulkCreator,
  RequestFlashcardBulkCreatorItem,
} from './request-flashcard-bulk-creator';
export type { FlashcardBulkCreatorResult } from './response-flashcard-bulk-creator';

@Injectable()
export class FlashcardBulkCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    requests: RequestFlashcardBulkCreator,
  ): Promise<FlashcardBulkCreatorResult> {
    if (requests.length === 0) throw new BulkEmptyFlashcards();

    const flashcards = requests.map((req: RequestFlashcardBulkCreatorItem) => {
      const {
        id,
        expression,
        meaning,
        category,
        subcategory,
        ipaNotation,
        nativeSpeech,
        examples,
        createdBy,
      } = req;

      return Flashcard.create(
        id,
        expression,
        meaning,
        category,
        subcategory,
        ipaNotation ?? null,
        nativeSpeech ?? null,
        examples,
        createdBy,
      );
    });

    await this.repository.saveAll(flashcards);

    const allEvents = flashcards.flatMap((fc) => fc.pullDomainEvents());
    await this.publisher.publish(allEvents);

    this.logger.info('Flashcards bulk created', { count: flashcards.length });

    return {
      created: flashcards.length,
      flashcards: flashcards.map((fc) => fc.toPrimitives()),
    };
  }
}
