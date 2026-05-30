import { type RequestGamePauser } from '@/gaming/application/pause/game-pauser';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export type { RequestGamePauser };

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
