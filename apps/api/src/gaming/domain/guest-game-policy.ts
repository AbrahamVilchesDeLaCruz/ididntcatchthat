import { GuestLimitExceeded } from './exceptions/guest-limit-exceeded';

export class GuestGamePolicy {
  static readonly MAX_DAILY_GAMES = 3;

  static assertCanStartNewGame(todayGameCount: number): void {
    if (todayGameCount >= GuestGamePolicy.MAX_DAILY_GAMES) {
      throw new GuestLimitExceeded();
    }
  }
}
