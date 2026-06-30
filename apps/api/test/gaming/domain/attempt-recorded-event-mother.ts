import {
  AttemptRecordedEvent,
  type AttemptRecordedAttributes,
} from '@/gaming/domain/events/attempt-recorded.event';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { DateMother } from '@test/shared/domain/date-mother';
import { BooleanMother } from '@test/shared/domain/boolean-mother';

export class AttemptRecordedEventMother {
  static random(
    overrides?: Partial<AttemptRecordedAttributes & { aggregateId?: string }>,
  ): AttemptRecordedEvent {
    const gameId = GameIdMother.random().value;
    const attrs: AttemptRecordedAttributes = {
      gameId,
      userId: UserIdMother.random().value,
      flashcardId: UuidMother.random(),
      flashcardModule: 'native_sounds',
      correct: BooleanMother.random(),
      mode: GameModeMother.game().value,
      answeredAt: DateMother.recent().toISOString(),
      ...overrides,
    };

    return new AttemptRecordedEvent(
      overrides?.aggregateId ?? attrs.gameId,
      attrs,
    );
  }

  static guest(
    overrides?: Partial<AttemptRecordedAttributes & { aggregateId?: string }>,
  ): AttemptRecordedEvent {
    return AttemptRecordedEventMother.random({ ...overrides, userId: null });
  }
}
