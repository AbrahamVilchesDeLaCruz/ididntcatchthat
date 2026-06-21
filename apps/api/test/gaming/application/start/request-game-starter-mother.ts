import { type RequestGameStarter } from '@/gaming/application/start/game-starter';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { GameModuleMother } from '@test/gaming/domain/game-module-mother';
import { CardCountMother } from '@test/gaming/domain/card-count-mother';

export type { RequestGameStarter };

export class RequestGameStarterMother {
  static random(overrides?: Partial<RequestGameStarter>): RequestGameStarter {
    return {
      userId: UserIdMother.random().value,
      mode: GameModeMother.study().value,
      module: GameModuleMother.nativeSounds().value,
      cardCount: CardCountMother.ten().toNumber(),
      ...overrides,
    };
  }

  static guest(overrides?: Partial<RequestGameStarter>): RequestGameStarter {
    return {
      userId: null,
      mode: GameModeMother.study().value,
      module: GameModuleMother.nativeSounds().value,
      cardCount: CardCountMother.ten().toNumber(),
      ...overrides,
    };
  }
}
