import { type RequestGameResumer } from '@/gaming/application/resume/game-resumer';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export type { RequestGameResumer };

export class RequestGameResumerMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGameResumer>,
  ): RequestGameResumer {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: UserIdMother.random().value,
      ...overrides,
    };
  }
}
