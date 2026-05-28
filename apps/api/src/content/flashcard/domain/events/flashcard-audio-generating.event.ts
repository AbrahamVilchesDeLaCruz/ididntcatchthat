import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type FlashcardAudioGeneratingAttributes = {
  flashcardId: string;
};

export class FlashcardAudioGeneratingEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.audio_generating';

  constructor(
    aggregateId: string,
    attributes: FlashcardAudioGeneratingAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardAudioGeneratingEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardAudioGeneratingEvent {
    return new FlashcardAudioGeneratingEvent(
      aggregateId,
      attributes as FlashcardAudioGeneratingAttributes,
      eventId,
      occurredOn,
    );
  }
}
