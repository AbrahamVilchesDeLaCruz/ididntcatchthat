import { type RequestGamePauser } from '@/gaming/application/pause/game-pauser';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestGamePauser };

export class RequestGamePauserMother {
  static random(
    gameId?: string,
    overrides?: Partial<RequestGamePauser>,
  ): RequestGamePauser {
    return {
      gameId: gameId ?? GameIdMother.random().value,
      userId: UserIdMother.random().value,
      lastFlashcardId: UuidMother.random(),
      ...overrides,
    };
  }
}
