import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface RankingProfileUpdatedAttributes extends DomainEventAttributes {
  userId: string;
  showInRanking: boolean;
  nickname: string;
}

export class RankingProfileUpdatedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'ididntcatchthat.identity.user.ranking_profile_updated';

  constructor(
    aggregateId: string,
    attributes: RankingProfileUpdatedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attributes, eventId, occurredOn);
  }

  eventName(): string {
    return RankingProfileUpdatedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    eventId: string,
    occurredOn: Date,
    attributes: DomainEventAttributes,
  ): RankingProfileUpdatedEvent {
    return new RankingProfileUpdatedEvent(
      aggregateId,
      attributes as RankingProfileUpdatedAttributes,
      eventId,
      occurredOn,
    );
  }
}
