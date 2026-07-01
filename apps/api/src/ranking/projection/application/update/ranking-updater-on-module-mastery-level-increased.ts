import { Inject, Injectable } from '@nestjs/common';
import { Subscriber } from '@/shared/application/subscriber';
import {
  type DomainEventConsumer,
  DOMAIN_EVENT_CONSUMER,
} from '@/shared/application/domain-event-consumer';
import { type DomainEvent } from '@/shared/domain/domain-event';
import {
  ModuleMasteryLevelIncreasedEvent,
  type ModuleMasteryLevelIncreasedAttributes,
} from '@/progress/domain/events/module-mastery-level-increased.event';
import { RecordRankingModuleMastery } from '@/ranking/projection/application/update/record-ranking-module-mastery';

@Injectable()
export class RankingUpdaterOnModuleMasteryLevelIncreased extends Subscriber {
  readonly queueName =
    'ranking.update_ranking_on_module_mastery_level_increased';
  readonly eventName = ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  readonly exchangeName = ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  readonly domainEvent = ModuleMasteryLevelIncreasedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly recorder: RecordRankingModuleMastery,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as ModuleMasteryLevelIncreasedAttributes;
    await this.recorder.execute({
      userId: attrs.userId,
      module: attrs.module,
      level: attrs.newLevel,
    });
  }
}
