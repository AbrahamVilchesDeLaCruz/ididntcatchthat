import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export interface RequestGameAbandoner {
  gameId: string;
  userId: string;
}

export class RequestGameAbandonerMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGameAbandoner>,
  ): RequestGameAbandoner {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: 'user-123',
      ...overrides,
    };
  }
}
