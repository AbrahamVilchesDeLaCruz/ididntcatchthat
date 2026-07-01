import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface FlashcardViewedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  flashcardId: string;
  flashcardModule: string | null;
  viewedAt: string;
}

export class FlashcardViewedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'ididntcatchthat.gaming.views.flashcard.viewed';

  constructor(
    aggregateId: string,
    readonly attrs: FlashcardViewedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return FlashcardViewedEvent.EVENT_NAME;
  }
}
