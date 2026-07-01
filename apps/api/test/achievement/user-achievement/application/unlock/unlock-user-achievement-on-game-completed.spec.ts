import { mock } from 'jest-mock-extended';
import { type DomainEventConsumer } from '@/shared/application/domain-event-consumer';
import { UnlockUserAchievementOnGameCompleted } from '@/achievement/user-achievement/application/unlock/unlock-user-achievement-on-game-completed';
import { type AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { type GameCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/game-completed-achievement-unlocker';
import { type StudyCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/study-completed-achievement-unlocker';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/user-achievement/application/unlock UnlockUserAchievementOnGameCompleted', () => {
  const consumer = mock<DomainEventConsumer>();
  const progressUpdater = mock<AchievementProgressUpdater>();
  const gameUnlocker = mock<GameCompletedAchievementUnlocker>();
  const studyUnlocker = mock<StudyCompletedAchievementUnlocker>();
  let handler: UnlockUserAchievementOnGameCompleted;

  beforeEach(() => {
    progressUpdater.applyGameCompleted.mockReset();
    gameUnlocker.execute.mockReset();
    studyUnlocker.execute.mockReset();
    handler = new UnlockUserAchievementOnGameCompleted(
      consumer,
      progressUpdater,
      gameUnlocker,
      studyUnlocker,
    );
  });

  it('should update progress and delegate game mode events to the game unlocker', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId, mode: 'game' });
    const progress = UserAchievementProgress.create(
      UserIdMother.withValue(userId),
    );
    progressUpdater.applyGameCompleted.mockResolvedValue(progress);

    await handler.on(event);

    expect(progressUpdater.applyGameCompleted).toHaveBeenCalledWith(
      event.attributes,
    );
    expect(gameUnlocker.execute).toHaveBeenCalledWith(
      event.attributes,
      progress,
    );
    expect(studyUnlocker.execute).not.toHaveBeenCalled();
  });

  it('should update progress and delegate study mode events to the study unlocker', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId, mode: 'study' });
    const progress = UserAchievementProgress.create(
      UserIdMother.withValue(userId),
    );
    progressUpdater.applyGameCompleted.mockResolvedValue(progress);

    await handler.on(event);

    expect(studyUnlocker.execute).toHaveBeenCalledWith(
      event.attributes,
      progress,
    );
    expect(gameUnlocker.execute).not.toHaveBeenCalled();
  });

  it('should skip guest events', async () => {
    const event = GameCompletedEventMother.guest();

    await handler.on(event);

    expect(progressUpdater.applyGameCompleted).not.toHaveBeenCalled();
    expect(gameUnlocker.execute).not.toHaveBeenCalled();
    expect(studyUnlocker.execute).not.toHaveBeenCalled();
  });

  it('should update progress but skip unlockers for unsupported modes', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      mode: 'unsupported-mode',
    });
    const progress = UserAchievementProgress.create(
      UserIdMother.withValue(userId),
    );
    progressUpdater.applyGameCompleted.mockResolvedValue(progress);

    await handler.on(event);

    expect(progressUpdater.applyGameCompleted).toHaveBeenCalledWith(
      event.attributes,
    );
    expect(gameUnlocker.execute).not.toHaveBeenCalled();
    expect(studyUnlocker.execute).not.toHaveBeenCalled();
  });
});
