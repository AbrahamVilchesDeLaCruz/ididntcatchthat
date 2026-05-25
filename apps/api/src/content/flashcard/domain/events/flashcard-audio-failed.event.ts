import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type FlashcardAudioFailedAttributes = {
  flashcardId: string;
};

export class FlashcardAudioFailedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.content.flashcard.audio_failed';

  constructor(
    aggregateId: string,
    attributes: FlashcardAudioFailedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardAudioFailedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardAudioFailedEvent {
    return new FlashcardAudioFailedEvent(
      aggregateId,
      attributes as FlashcardAudioFailedAttributes,
      eventId,
      occurredOn,
    );
  }
}
