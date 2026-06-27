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
import { AchievementUnlocker } from '@/achievement/application/unlock/achievement-unlocker';

@Injectable()
export class UnlockAchievementOnModuleMasteryLevelIncreased extends Subscriber {
  readonly queueName =
    'achievement.unlock_achievement_on_module_mastery_level_increased';
  readonly eventName = ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  readonly exchangeName = ModuleMasteryLevelIncreasedEvent.EVENT_NAME;
  readonly domainEvent = ModuleMasteryLevelIncreasedEvent;

  constructor(
    @Inject(DOMAIN_EVENT_CONSUMER) consumer: DomainEventConsumer,
    private readonly unlocker: AchievementUnlocker,
  ) {
    super(consumer);
  }

  async on(event: DomainEvent): Promise<void> {
    const attrs = event.attributes as ModuleMasteryLevelIncreasedAttributes;
    if (attrs.newLevel >= 2) {
      await this.unlocker.unlock(attrs.userId, 'module_mastery_2');
    }
    if (attrs.newLevel >= 3) {
      await this.unlocker.unlock(attrs.userId, 'module_mastery_3');
    }
  }
}
