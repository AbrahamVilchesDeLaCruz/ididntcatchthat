export interface RequestPausedGamesLister {
  userId: string;
}

export class RequestPausedGamesListerMother {
  static random(userId?: string): RequestPausedGamesLister {
    return { userId: userId ?? 'user-123' };
  }
}
