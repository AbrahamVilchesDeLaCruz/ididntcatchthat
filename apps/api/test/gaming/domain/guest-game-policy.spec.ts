import { GuestGamePolicy } from '@/gaming/domain/guest-game-policy';
import { GuestLimitExceeded } from '@/gaming/domain/exceptions/guest-limit-exceeded';

describe('gaming/domain GuestGamePolicy', () => {
  it('should allow starting when daily count is below the limit', () => {
    expect(() =>
      GuestGamePolicy.assertCanStartNewGame(
        GuestGamePolicy.MAX_DAILY_GAMES - 1,
      ),
    ).not.toThrow();
  });

  it('should reject when daily count reaches the limit', () => {
    expect(() =>
      GuestGamePolicy.assertCanStartNewGame(GuestGamePolicy.MAX_DAILY_GAMES),
    ).toThrow(GuestLimitExceeded);
  });
});
