import { type RequestGameAbandoner } from '@/gaming/application/abandon/game-abandoner';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export type { RequestGameAbandoner };

export class RequestGameAbandonerMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGameAbandoner>,
  ): RequestGameAbandoner {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: UserIdMother.random().value,
      ...overrides,
    };
  }
}
