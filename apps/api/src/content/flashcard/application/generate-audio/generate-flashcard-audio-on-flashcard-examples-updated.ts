import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardExamplesUpdatedEvent } from '@/content/flashcard/domain/events/flashcard-examples-updated.event';
import { FlashcardAudioGenerator } from './flashcard-audio-generator';

@Injectable()
export class GenerateFlashcardAudioOnFlashcardExamplesUpdated extends Subscriber {
  readonly queueName = 'generate_flashcard_audio_on_flashcard_examples_updated';
  readonly eventName = FlashcardExamplesUpdatedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardExamplesUpdatedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardExamplesUpdatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(FlashcardAudioGenerator)
    private readonly generator: FlashcardAudioGenerator,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    await this.generator.execute({ flashcardId: event.aggregateId });
  }
}
