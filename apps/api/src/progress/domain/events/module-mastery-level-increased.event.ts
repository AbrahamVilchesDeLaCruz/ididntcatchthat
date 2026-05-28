import {
  DomainEvent,
  type DomainEventAttributes,
} from '@/shared/domain/domain-event';

export interface ModuleMasteryLevelIncreasedAttributes extends DomainEventAttributes {
  userId: string;
  module: string;
  previousLevel: number;
  newLevel: number;
  occurredAt: string;
}

export class ModuleMasteryLevelIncreasedEvent extends DomainEvent {
  static readonly EVENT_NAME =
    'idct.progress.module_progress.module_mastery_level.increased';

  constructor(
    aggregateId: string,
    readonly attrs: ModuleMasteryLevelIncreasedAttributes,
    eventId?: string,
    occurredOn?: Date,
  ) {
    super(aggregateId, attrs, eventId, occurredOn);
  }

  eventName(): string {
    return ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  }

  static fromPrimitives(
    aggregateId: string,
    attrs: ModuleMasteryLevelIncreasedAttributes,
    eventId: string,
    occurredOn: Date,
  ): ModuleMasteryLevelIncreasedEvent {
    return new ModuleMasteryLevelIncreasedEvent(
      aggregateId,
      attrs,
      eventId,
      occurredOn,
    );
  }
}
