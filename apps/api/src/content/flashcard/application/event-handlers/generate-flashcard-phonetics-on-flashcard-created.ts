import { Inject, Injectable } from '@nestjs/common';
import { Handler } from '@/shared/application/handler';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { AiPhoneticsCompleter } from '../complete-phonetics/ai-phonetics-completer';

@Injectable()
export class GenerateFlashcardPhoneticsOnFlashcardCreated extends Handler {
  readonly queueName = 'generate_flashcard_phonetics_on_flashcard_created';
  readonly eventName = FlashcardCreatedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardCreatedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardCreatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly completer: AiPhoneticsCompleter,
  ) {
    super(consumer);
  }

  async handle(event: DomainEvent): Promise<void> {
    await this.completer.execute({ flashcardId: event.aggregateId });
  }
}
