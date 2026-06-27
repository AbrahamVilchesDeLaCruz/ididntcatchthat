import { Game } from '@/gaming/domain/game';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { GameModuleMother } from '@test/gaming/domain/game-module-mother';
import { CardCountMother } from '@test/gaming/domain/card-count-mother';

export class GameMother {
  static randomFlashcardIds(count = 3): string[] {
    return Array.from({ length: count }, () => UuidMother.random());
  }

  static random(
    overrides?: Partial<{
      userId: string | null;
      mode: string;
      module: string | null;
      subcategory: string | null;
      cardCount: string;
      flashcardIds: string[];
    }>,
  ): Game {
    return Game.start(
      overrides?.userId ?? UserIdMother.random().value,
      overrides?.mode ?? GameModeMother.study().value,
      overrides?.module ?? GameModuleMother.nativeSounds().value,
      overrides?.subcategory ?? null,
      overrides?.cardCount ?? CardCountMother.ten().value,
      overrides?.flashcardIds ?? GameMother.randomFlashcardIds(),
    );
  }

  static inProgress(
    overrides?: Partial<{
      userId: string | null;
      mode: string;
      module: string | null;
      subcategory: string | null;
      cardCount: string;
      flashcardIds: string[];
    }>,
  ): Game {
    return GameMother.random(overrides);
  }

  static paused(
    overrides?: Partial<{
      userId: string | null;
      mode: string;
      module: string | null;
      subcategory: string | null;
      cardCount: string;
      flashcardIds: string[];
    }>,
  ): Game {
    const flashcardIds =
      overrides?.flashcardIds ?? GameMother.randomFlashcardIds();
    const game = GameMother.random({ ...overrides, flashcardIds });
    game.pause(flashcardIds[0]);
    game.pullDomainEvents();
    return game;
  }

  static completed(
    overrides?: Partial<{
      userId: string | null;
      mode: string;
      module: string | null;
      subcategory: string | null;
      cardCount: string;
    }>,
  ): Game {
    const flashcardIds = [UuidMother.random()];
    const game = GameMother.random({ ...overrides, flashcardIds });
    game.recordAttempt(flashcardIds[0], true);
    game.complete();
    game.pullDomainEvents();
    return game;
  }

  static withId(id: string): Game {
    const flashcardIds = GameMother.randomFlashcardIds();
    return Game.fromPrimitives({
      id,
      userId: UserIdMother.random().value,
      mode: GameModeMother.study().value,
      module: GameModuleMother.nativeSounds().value,
      subcategory: null,
      cardCount: CardCountMother.ten().value,
      status: 'in_progress',
      flashcardIds,
      lastFlashcardId: null,
      startedAt: new Date(),
      finishedAt: null,
      attempts: [],
    });
  }
}
