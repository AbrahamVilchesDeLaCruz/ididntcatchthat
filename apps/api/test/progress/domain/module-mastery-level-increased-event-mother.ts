import {
  ModuleMasteryLevelIncreasedEvent,
  type ModuleMasteryLevelIncreasedAttributes,
} from '@/progress/domain/events/module-mastery-level-increased.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { ModuleNameMother } from '@test/progress/domain/module-name-mother';
import { ModuleMasteryLevelMother } from '@test/progress/domain/module-mastery-level-mother';
import { DateMother } from '@test/shared/domain/date-mother';

export class ModuleMasteryLevelIncreasedEventMother {
  static random(
    overrides?: Partial<
      ModuleMasteryLevelIncreasedAttributes & { aggregateId?: string }
    >,
  ): ModuleMasteryLevelIncreasedEvent {
    const userId = UserIdMother.random().value;
    const previousLevel = ModuleMasteryLevelMother.beginner();
    const attrs: ModuleMasteryLevelIncreasedAttributes = {
      userId,
      module: ModuleNameMother.nativeSounds().value,
      previousLevel,
      newLevel: previousLevel + 1,
      occurredAt: DateMother.recent().toISOString(),
      ...overrides,
    };

    return new ModuleMasteryLevelIncreasedEvent(
      overrides?.aggregateId ?? userId,
      attrs,
    );
  }

  static withLevel(
    newLevel: number,
    overrides?: Partial<
      ModuleMasteryLevelIncreasedAttributes & { aggregateId?: string }
    >,
  ): ModuleMasteryLevelIncreasedEvent {
    return ModuleMasteryLevelIncreasedEventMother.random({
      previousLevel: newLevel - 1,
      newLevel,
      ...overrides,
    });
  }
}
