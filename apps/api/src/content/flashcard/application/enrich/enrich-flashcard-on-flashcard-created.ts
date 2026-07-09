import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { AiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { AiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';

@Injectable()
export class EnrichFlashcardOnFlashcardCreated extends Subscriber {
  readonly queueName = 'enrich_flashcard_on_flashcard_created';
  readonly eventName = FlashcardCreatedEvent.EVENT_NAME;
  readonly exchangeName = FlashcardCreatedEvent.EVENT_NAME;
  readonly domainEvent = FlashcardCreatedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    @Inject(AiExamplesCompleter)
    private readonly examplesCompleter: AiExamplesCompleter,
    @Inject(AiPhoneticsCompleter)
    private readonly phoneticsCompleter: AiPhoneticsCompleter,
    @Inject(FlashcardAudioGenerator)
    private readonly audioGenerator: FlashcardAudioGenerator,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const flashcardId = event.aggregateId;
    await this.examplesCompleter.execute({ flashcardId });
    await this.phoneticsCompleter.execute({ flashcardId });
    await this.audioGenerator.execute({ flashcardId });
  }
}
