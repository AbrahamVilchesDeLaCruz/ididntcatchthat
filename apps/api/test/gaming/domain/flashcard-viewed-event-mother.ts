import {
  FlashcardViewedEvent,
  type FlashcardViewedAttributes,
} from '@/gaming/domain/events/flashcard-viewed.event';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { GameModuleMother } from '@test/gaming/domain/game-module-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

export class FlashcardViewedEventMother {
  static random(
    overrides?: Partial<FlashcardViewedAttributes & { aggregateId?: string }>,
  ): FlashcardViewedEvent {
    const gameId = GameIdMother.random().value;
    const attrs: FlashcardViewedAttributes = {
      gameId,
      userId: UserIdMother.random().value,
      flashcardId: ProgressFlashcardIdMother.random().value,
      flashcardModule: GameModuleMother.nativeSounds().value,
      viewedAt: DateMother.recent().toISOString(),
      ...overrides,
    };

    return new FlashcardViewedEvent(
      overrides?.aggregateId ?? attrs.gameId,
      attrs,
    );
  }

  static guest(
    overrides?: Partial<FlashcardViewedAttributes & { aggregateId?: string }>,
  ): FlashcardViewedEvent {
    return FlashcardViewedEventMother.random({ ...overrides, userId: null });
  }
}
