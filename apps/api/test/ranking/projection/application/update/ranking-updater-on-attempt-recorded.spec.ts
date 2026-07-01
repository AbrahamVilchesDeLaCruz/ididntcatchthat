import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RecordRankingAttempt } from '@/ranking/projection/application/update/record-ranking-attempt';
import { RankingUpdaterOnAttemptRecorded } from '@/ranking/projection/application/update/ranking-updater-on-attempt-recorded';
import { AttemptRecordedEventMother } from '@test/gaming/domain/attempt-recorded-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('ranking/projection/application/update RankingUpdaterOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const recorder = mock<RecordRankingAttempt>();
  let handler: RankingUpdaterOnAttemptRecorded;

  beforeEach(() => {
    recorder.execute.mockReset();
    recorder.execute.mockResolvedValue(undefined);
    handler = new RankingUpdaterOnAttemptRecorded(consumer, recorder);
  });

  it('should skip when userId is null', async () => {
    await handler.on(AttemptRecordedEventMother.guest());

    expect(recorder.execute).not.toHaveBeenCalled();
  });

  it('should delegate to RecordRankingAttempt', async () => {
    const userId = UserIdMother.random().value;
    const answeredAt = DateMother.recent().toISOString();
    const event = AttemptRecordedEventMother.random({
      userId,
      mode: GameModeMother.game().value,
      correct: true,
      answeredAt,
    });

    await handler.on(event);

    expect(recorder.execute).toHaveBeenCalledWith({
      userId,
      mode: event.attributes.mode as string,
      correct: true,
      answeredAt,
    });
  });
});
