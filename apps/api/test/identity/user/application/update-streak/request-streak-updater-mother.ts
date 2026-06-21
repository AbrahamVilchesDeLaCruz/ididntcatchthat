import { type RequestStreakUpdater } from '@/identity/user/application/update-streak/streak-updater';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

export type { RequestStreakUpdater } from '@/identity/user/application/update-streak/streak-updater';

export class RequestStreakUpdaterMother {
  static random(
    overrides?: Partial<RequestStreakUpdater>,
  ): RequestStreakUpdater {
    return {
      userId: UserIdMother.random().value,
      activityDate: DateMother.recent().toISOString(),
      ...overrides,
    };
  }
}
