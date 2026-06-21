import { type RequestPausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export type { RequestPausedGamesLister };

export class RequestPausedGamesListerMother {
  static random(userId?: string): RequestPausedGamesLister {
    return { userId: userId ?? UserIdMother.random().value };
  }
}
