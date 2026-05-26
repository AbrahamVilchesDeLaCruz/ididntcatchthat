import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface GameAbandonedAttributes extends DomainEventAttributes {
  gameId: string;
  userId: string | null;
}

export class GameAbandonedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly attrs: GameAbandonedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return 'ididntcatchthat.gaming.games.game.abandoned';
  }
}
