import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface GamePausedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
  lastFlashcardId: string;
}

export class GamePausedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly attrs: GamePausedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return 'ididntcatchthat.gaming.games.game.paused';
  }
}
