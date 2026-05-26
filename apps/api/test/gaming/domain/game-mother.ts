import { Game } from '@/gaming/domain/game';

const DEFAULT_FLASHCARD_IDS = ['fc-1', 'fc-2', 'fc-3'];
const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export class GameMother {
  static random(
    overrides?: Partial<{
      userId: string | null;
      mode: string;
      module: string | null;
      cardCount: string;
      flashcardIds: string[];
    }>,
  ): Game {
    return Game.start(
      overrides?.userId ?? DEFAULT_USER_ID,
      overrides?.mode ?? 'study',
      overrides?.module ?? 'native_sounds',
      overrides?.cardCount ?? '10',
      overrides?.flashcardIds ?? DEFAULT_FLASHCARD_IDS,
    );
  }

  static inProgress(
    overrides?: Partial<{
      userId: string | null;
      mode: string;
      module: string | null;
      cardCount: string;
      flashcardIds: string[];
    }>,
  ): Game {
    return GameMother.random(overrides);
  }

  static paused(): Game {
    const game = GameMother.random();
    game.pause('fc-1');
    game.pullDomainEvents();
    return game;
  }

  static completed(): Game {
    const flashcardIds = ['fc-1'];
    const game = Game.start(
      DEFAULT_USER_ID,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.recordAttempt('fc-1', true);
    game.complete();
    game.pullDomainEvents();
    return game;
  }

  static withId(id: string): Game {
    return Game.fromPrimitives({
      id,
      userId: DEFAULT_USER_ID,
      mode: 'study',
      module: 'native_sounds',
      cardCount: '10',
      status: 'in_progress',
      flashcardIds: DEFAULT_FLASHCARD_IDS,
      lastFlashcardId: null,
      startedAt: new Date(),
      finishedAt: null,
      attempts: [],
    });
  }
}
