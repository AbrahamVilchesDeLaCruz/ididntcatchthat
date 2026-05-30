import { Inject, Injectable } from '@nestjs/common';
import {
  type Flashcard,
  type FlashcardPrimitives,
} from '@/content/flashcard/domain/flashcard';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestFlashcardUpdater } from './request-flashcard-updater';

export type { RequestFlashcardUpdater } from './request-flashcard-updater';

@Injectable()
export class FlashcardUpdater {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestFlashcardUpdater,
  ): Promise<FlashcardPrimitives> {
    const { id, requesterId, requesterRole, fields } = request;

    const flashcard = await this.findOrFail(id);

    flashcard.assertCanBeModifiedBy(requesterId, requesterRole);
    flashcard.update(fields);

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard updated', {
      flashcardId: id,
      requesterId,
      fields: Object.keys(fields),
    });

    return flashcard.toPrimitives();
  }

  private async findOrFail(id: string): Promise<Flashcard> {
    const flashcard = await this.repository.search(new FlashcardId(id));
    if (!flashcard) throw new FlashcardNotFound();
    return flashcard;
  }
}
