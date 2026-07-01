import {
  RankingProfileUpdatedEvent,
  type RankingProfileUpdatedAttributes,
} from '@/identity/user/domain/events/ranking-profile-updated.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';

export class RankingProfileUpdatedEventMother {
  static random(
    overrides?: Partial<
      RankingProfileUpdatedAttributes & { aggregateId?: string }
    >,
  ): RankingProfileUpdatedEvent {
    const userId = UserIdMother.random().value;
    const attrs: RankingProfileUpdatedAttributes = {
      userId,
      showInRanking: true,
      nickname: NicknameMother.random().value,
      ...overrides,
    };

    return new RankingProfileUpdatedEvent(
      overrides?.aggregateId ?? userId,
      attrs,
    );
  }

  static optedIn(
    overrides?: Partial<
      RankingProfileUpdatedAttributes & { aggregateId?: string }
    >,
  ): RankingProfileUpdatedEvent {
    return RankingProfileUpdatedEventMother.random({
      showInRanking: true,
      ...overrides,
    });
  }

  static optedOut(
    overrides?: Partial<
      RankingProfileUpdatedAttributes & { aggregateId?: string }
    >,
  ): RankingProfileUpdatedEvent {
    return RankingProfileUpdatedEventMother.random({
      showInRanking: false,
      ...overrides,
    });
  }
}
