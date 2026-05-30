import { Inject, Injectable } from '@nestjs/common';
import {
  Flashcard,
  type FlashcardPrimitives,
} from '@/content/flashcard/domain/flashcard';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestFlashcardCreator } from './request-flashcard-creator';

export type { RequestFlashcardCreator } from './request-flashcard-creator';

@Injectable()
export class FlashcardCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestFlashcardCreator,
  ): Promise<FlashcardPrimitives> {
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
    } = request;

    const flashcard = Flashcard.create(
      id,
      expression,
      meaning,
      category,
      subcategory,
      ipaNotation,
      nativeSpeech,
      examples.map((e) => ({ ...e, flashcardId: id })),
      createdBy,
    );

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard created', {
      flashcardId: id,
      expression,
      createdBy,
    });

    return flashcard.toPrimitives();
  }
}
