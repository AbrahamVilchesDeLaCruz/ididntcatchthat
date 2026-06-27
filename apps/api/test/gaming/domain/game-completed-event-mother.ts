import {
  GameCompletedEvent,
  type GameCompletedAttributes,
} from '@/gaming/domain/events/game-completed.event';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { CardCountMother } from '@test/gaming/domain/card-count-mother';
import { DateMother } from '@test/shared/domain/date-mother';

export class GameCompletedEventMother {
  static random(
    overrides?: Partial<GameCompletedAttributes & { aggregateId?: string }>,
  ): GameCompletedEvent {
    const gameId = GameIdMother.random().value;
    const attrs: GameCompletedAttributes = {
      gameId,
      userId: UserIdMother.random().value,
      mode: GameModeMother.game().value,
      module: null,
      subcategory: null,
      source: GameSourceValue.Catalog,
      cardCount: CardCountMother.ten().value,
      correctCount: 10,
      totalCount: 10,
      startedAt: DateMother.recent().toISOString(),
      finishedAt: DateMother.recent().toISOString(),
      ...overrides,
    };

    return new GameCompletedEvent(
      overrides?.aggregateId ?? attrs.gameId,
      attrs,
    );
  }

  static guest(
    overrides?: Partial<GameCompletedAttributes & { aggregateId?: string }>,
  ): GameCompletedEvent {
    return GameCompletedEventMother.random({ ...overrides, userId: null });
  }
}
