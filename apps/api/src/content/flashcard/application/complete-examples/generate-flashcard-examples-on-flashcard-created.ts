import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { AiExamplesCompleter } from './ai-examples-completer';

@Injectable()
export class GenerateFlashcardExamplesOnFlashcardCreated extends Subscriber {
  readonly queueName = 'generate_flashcard_examples_on_flashcard_created';
  readonly eventName = FlashcardCreatedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardCreatedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardCreatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly examplesCompleter: AiExamplesCompleter,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    await this.examplesCompleter.execute({ flashcardId: event.aggregateId });
  }
}
