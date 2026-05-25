import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export type FlashcardMeaningUpdatedAttributes = {
  flashcardId: string;
  meaning: string;
};

export class FlashcardMeaningUpdatedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.content.flashcard.meaning_updated';

  constructor(
    aggregateId: string,
    attributes: FlashcardMeaningUpdatedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardMeaningUpdatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): FlashcardMeaningUpdatedEvent {
    return new FlashcardMeaningUpdatedEvent(
      aggregateId,
      attributes as FlashcardMeaningUpdatedAttributes,
      eventId,
      occurredOn,
    );
  }
}
