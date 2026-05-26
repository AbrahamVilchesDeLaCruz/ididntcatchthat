import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export interface RequestGameCompleter {
  gameId: string;
  userId: string | null;
}

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
