import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { type AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { UpdateAchievementProgressOnAttemptRecorded } from '@/achievement/progress/application/update/update-achievement-progress-on-attempt-recorded';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { AttemptRecordedEventMother } from '@test/gaming/domain/attempt-recorded-event-mother';

describe('achievement/progress/application/update UpdateAchievementProgressOnAttemptRecorded', () => {
  const consumer = mock<DomainEventConsumer>();
  const progressUpdater = mock<AchievementProgressUpdater>();
  let handler: UpdateAchievementProgressOnAttemptRecorded;

  beforeEach(() => {
    progressUpdater.applyAttemptRecorded.mockReset();
    progressUpdater.applyAttemptRecorded.mockResolvedValue(null);
    handler = new UpdateAchievementProgressOnAttemptRecorded(
      consumer,
      progressUpdater,
    );
  });

  it('should delegate to AchievementProgressUpdater', async () => {
    const event = AttemptRecordedEventMother.random();

    await handler.on(event);

    expect(progressUpdater.applyAttemptRecorded).toHaveBeenCalledWith(
      event.attributes,
    );
  });

  it('should subscribe to AttemptRecordedEvent', () => {
    expect(handler.eventName).toBe(AttemptRecordedEvent.EVENT_NAME);
  });
});
