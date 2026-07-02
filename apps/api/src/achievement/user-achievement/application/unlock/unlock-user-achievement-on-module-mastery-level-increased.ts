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
import { ModuleMasteryAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/module-mastery-achievement-unlocker';

@Injectable()
export class UnlockUserAchievementOnModuleMasteryLevelIncreased extends Subscriber {
  readonly queueName =
    'achievement.unlock_achievement_on_module_mastery_level_increased';
  readonly eventName = ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  readonly exchangeName = ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  readonly domainEvent = ModuleMasteryLevelIncreasedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly unlocker: ModuleMasteryAchievementUnlocker,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as ModuleMasteryLevelIncreasedAttributes;
    await this.unlocker.execute({
      userId: attrs.userId,
      newLevel: attrs.newLevel,
    });
  }
}
