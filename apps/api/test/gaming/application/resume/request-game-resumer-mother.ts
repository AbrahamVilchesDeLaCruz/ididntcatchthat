import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export interface RequestGameResumer {
  gameId: string;
  userId: string;
}

export class RequestGameResumerMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGameResumer>,
  ): RequestGameResumer {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: 'user-123',
      ...overrides,
    };
  }
}
