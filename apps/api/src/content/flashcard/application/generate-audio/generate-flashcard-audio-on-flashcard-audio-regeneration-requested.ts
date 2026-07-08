import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardAudioRegenerationRequestedEvent } from '@/content/flashcard/domain/events/flashcard-audio-regeneration-requested.event';
import { FlashcardAudioGenerator } from './flashcard-audio-generator';

@Injectable()
export class GenerateFlashcardAudioOnFlashcardAudioRegenerationRequested extends Subscriber {
  readonly queueName =
    'generate_flashcard_audio_on_flashcard_audio_regeneration_requested';
  readonly eventName = FlashcardAudioRegenerationRequestedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardAudioRegenerationRequestedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardAudioRegenerationRequestedEvent;

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
