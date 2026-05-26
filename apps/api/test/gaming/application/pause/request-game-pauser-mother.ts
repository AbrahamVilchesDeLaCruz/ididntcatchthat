import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export interface RequestGamePauser {
  gameId: string;
  userId: string;
  lastFlashcardId: string;
}

export class RequestGamePauserMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGamePauser>,
  ): RequestGamePauser {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: 'user-123',
      lastFlashcardId: 'fc-1',
      ...overrides,
    };
  }
}
