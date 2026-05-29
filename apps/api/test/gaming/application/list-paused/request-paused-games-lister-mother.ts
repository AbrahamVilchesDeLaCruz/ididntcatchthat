import { type RequestPausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';

export type { RequestPausedGamesLister };

export class RequestPausedGamesListerMother {
  static random(userId?: string): RequestPausedGamesLister {
    return { userId: userId ?? 'user-123' };
  }
}
