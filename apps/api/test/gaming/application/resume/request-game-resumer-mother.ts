import { type RequestGameResumer } from '@/gaming/application/resume/game-resumer';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';

export type { RequestGameResumer };

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
