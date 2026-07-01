import {
  StreakUpdatedEvent,
  type StreakUpdatedAttributes,
} from '@/identity/user/domain/events/streak-updated.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { StreakCountMother } from '@test/identity/user/domain/streak-count-mother';
import { DateMother } from '@test/shared/domain/date-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class StreakUpdatedEventMother {
  static random(
    overrides?: Partial<StreakUpdatedAttributes & { aggregateId?: string }>,
  ): StreakUpdatedEvent {
    const userId = UserIdMother.random().value;
    const previousStreak = StreakCountMother.week();
    const attrs: StreakUpdatedAttributes = {
      userId,
      previousStreak,
      newStreak: previousStreak + 1,
      occurredAt: DateMother.recent().toISOString(),
      ...overrides,
    };

    return new StreakUpdatedEvent(overrides?.aggregateId ?? userId, attrs);
  }

  static withStreak(
    newStreak: number,
    overrides?: Partial<StreakUpdatedAttributes & { aggregateId?: string }>,
  ): StreakUpdatedEvent {
    return StreakUpdatedEventMother.random({
      previousStreak: newStreak - 1,
      newStreak,
      ...overrides,
    });
  }

  static milestone(
    overrides?: Partial<StreakUpdatedAttributes & { aggregateId?: string }>,
  ): StreakUpdatedEvent {
    const userId = overrides?.userId ?? UuidMother.random();
    return StreakUpdatedEventMother.withStreak(StreakCountMother.month(), {
      userId,
      ...overrides,
    });
  }
}
