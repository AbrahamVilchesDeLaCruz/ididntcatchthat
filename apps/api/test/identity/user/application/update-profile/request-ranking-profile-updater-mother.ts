import { type RequestRankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { BooleanMother } from '@test/shared/domain/boolean-mother';

export type { RequestRankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';

export class RequestRankingProfileUpdaterMother {
  static random(
    overrides?: Partial<RequestRankingProfileUpdater>,
  ): RequestRankingProfileUpdater {
    return {
      userId: UserIdMother.random().value,
      showInRanking: BooleanMother.random(),
      nickname: NicknameMother.random().value,
      ...overrides,
    };
  }
}
