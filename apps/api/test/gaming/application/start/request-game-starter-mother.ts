import { type RequestGameStarter } from '@/gaming/application/start/game-starter';

export type { RequestGameStarter };

export class RequestGameStarterMother {
  static random(overrides?: Partial<RequestGameStarter>): RequestGameStarter {
    return {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      mode: 'study',
      module: 'native_sounds',
      cardCount: 10,
      ...overrides,
    };
  }

  static guest(overrides?: Partial<RequestGameStarter>): RequestGameStarter {
    return {
      userId: null,
      mode: 'study',
      module: 'native_sounds',
      cardCount: 10,
      ...overrides,
    };
  }
}
