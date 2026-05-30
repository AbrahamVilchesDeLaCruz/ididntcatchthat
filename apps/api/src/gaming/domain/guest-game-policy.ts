import { GuestLimitExceeded } from './exceptions/guest-limit-exceeded';

export class GuestGamePolicy {
  static readonly MAX_DAILY_GAMES = 3;
  static readonly MAX_CARD_COUNT_FOR_GUEST = 10;

  static assertCanStartNewGame(todayGameCount: number): void {
    if (todayGameCount >= GuestGamePolicy.MAX_DAILY_GAMES) {
      throw new GuestLimitExceeded();
    }
  }
}
