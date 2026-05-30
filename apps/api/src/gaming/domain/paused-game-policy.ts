import { MaxPausedGamesReached } from './exceptions/max-paused-games-reached';
import { type Game } from './game';

export class PausedGamePolicy {
  static readonly MAX_PAUSED = 5;

  static assertCanPauseAnother(pausedGames: Game[]): void {
    if (pausedGames.length >= PausedGamePolicy.MAX_PAUSED) {
      throw new MaxPausedGamesReached(pausedGames.map((g) => g.id.value));
    }
  }
}
