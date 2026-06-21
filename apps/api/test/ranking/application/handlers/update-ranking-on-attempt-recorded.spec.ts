import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { UpdateRankingOnAttemptRecorded } from '@/ranking/application/handlers/update-ranking-on-attempt-recorded';
import { AttemptRecordedEventMother } from '@test/gaming/domain/attempt-recorded-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

describe('ranking/application/handlers UpdateRankingOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const updater = mock<RankingUpdater>();
  let handler: UpdateRankingOnAttemptRecorded;

  beforeEach(() => {
    updater.recordAttempt.mockReset();
    updater.recordAttempt.mockResolvedValue(undefined);
    handler = new UpdateRankingOnAttemptRecorded(consumer, updater);
  });

  it('should skip when userId is null', async () => {
    await handler.on(AttemptRecordedEventMother.guest());

    expect(updater.recordAttempt).not.toHaveBeenCalled();
  });

  it('should delegate to RankingUpdater', async () => {
    const userId = UserIdMother.random().value;
    const answeredAt = DateMother.recent().toISOString();
    const event = AttemptRecordedEventMother.random({
      userId,
      correct: true,
      answeredAt,
    });

    await handler.on(event);

    expect(updater.recordAttempt).toHaveBeenCalledWith(
      userId,
      event.attrs.mode,
      true,
      answeredAt,
    );
  });
});
