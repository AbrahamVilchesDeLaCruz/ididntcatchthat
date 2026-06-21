import { type RequestGameCompleter } from '@/gaming/application/complete/game-completer';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export type { RequestGameCompleter };

export class RequestGameCompleterMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGameCompleter>,
  ): RequestGameCompleter {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: UserIdMother.random().value,
      ...overrides,
    };
  }
}
