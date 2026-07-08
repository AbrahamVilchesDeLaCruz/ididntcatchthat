import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type FlashcardAudioRegenerationRequestedAttributes = {
  flashcardId: string;
};

export class FlashcardAudioRegenerationRequestedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.audio_regeneration_requested';

  constructor(
    aggregateId: string,
    attributes: FlashcardAudioRegenerationRequestedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardAudioRegenerationRequestedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardAudioRegenerationRequestedEvent {
    return new FlashcardAudioRegenerationRequestedEvent(
      aggregateId,
      attributes as FlashcardAudioRegenerationRequestedAttributes,
      eventId,
      occurredOn,
    );
  }
}
