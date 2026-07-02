import { PausedGamePolicy } from '@/gaming/domain/paused-game-policy';
import { MaxPausedGamesReached } from '@/gaming/domain/exceptions/max-paused-games-reached';
import { GameMother } from '@test/gaming/domain/game-mother';

describe('gaming/domain PausedGamePolicy', () => {
  it('should allow pausing when below the limit', () => {
    const pausedGames = Array.from(
      { length: PausedGamePolicy.MAX_PAUSED - 1 },
      () => GameMother.paused(),
    );

    expect(() =>
      PausedGamePolicy.assertCanPauseAnother(pausedGames),
    ).not.toThrow();
  });

  it('should reject when max paused games reached', () => {
    const pausedGames = Array.from(
      { length: PausedGamePolicy.MAX_PAUSED },
      () => GameMother.paused(),
    );

    expect(() => PausedGamePolicy.assertCanPauseAnother(pausedGames)).toThrow(
      MaxPausedGamesReached,
    );
  });
});
