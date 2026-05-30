import { type RequestGameCompleter } from '@/gaming/application/complete/game-completer';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export type { RequestGameCompleter };

export class RequestGameCompleterMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGameCompleter>,
  ): RequestGameCompleter {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: 'user-123',
      ...overrides,
    };
  }
}
