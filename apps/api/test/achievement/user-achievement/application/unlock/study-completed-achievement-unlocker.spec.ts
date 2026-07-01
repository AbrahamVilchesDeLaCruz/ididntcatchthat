import { mock } from 'jest-mock-extended';
import { StudyCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/study-completed-achievement-unlocker';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';
import { type UserAchievementUnlocker } from '@/achievement/user-achievement/domain/user-achievement-unlocker';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { allStudyCompletedConditionStrategies } from '@/achievement/catalog/domain/unlock/study-completed-condition-strategies';
import { StudyCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/study-completed-achievement-unlock-policy';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { AchievementKeyValue } from '@/achievement/shared/domain/achievement-key-values';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/user-achievement/application/unlock StudyCompletedAchievementUnlocker', () => {
  const unlocker = mock<UserAchievementUnlocker>();
  const catalog = new AchievementCatalog();
  let evaluator: StudyCompletedAchievementUnlocker;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(undefined);

    const ruleUnlocker = new CatalogRuleAchievementUnlocker(unlocker, catalog);
    const policy = new StudyCompletedAchievementUnlockPolicy(
      allStudyCompletedConditionStrategies(),
    );

    evaluator = new StudyCompletedAchievementUnlocker(ruleUnlocker, policy);
  });

  it('should skip guest events', async () => {
    const event = GameCompletedEventMother.guest({ mode: 'study' });
    const progress = UserAchievementProgress.fromPrimitives({
      userId: UserIdMother.random().value,
      completedGamesCount: 0,
      completedStudySessionsCount: 1,
      totalPlayedAttempts: 0,
      touchedModules: [],
    });

    await evaluator.execute(event.attributes as never, progress);

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });

  it('should skip game mode', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId, mode: 'game' });
    const progress = UserAchievementProgress.fromPrimitives({
      userId,
      completedGamesCount: 0,
      completedStudySessionsCount: 1,
      totalPlayedAttempts: 0,
      touchedModules: [],
    });

    await evaluator.execute(event.attributes as never, progress);

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });

  it('should unlock study achievements for study mode', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      mode: 'study',
    });
    const progress = UserAchievementProgress.fromPrimitives({
      userId,
      completedGamesCount: 0,
      completedStudySessionsCount: 10,
      totalPlayedAttempts: 0,
      touchedModules: [],
    });

    await evaluator.execute(event.attributes as never, progress);

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.StudyFirst),
    );
    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.StudySessions10),
    );
    expect(unlocker.unlock).not.toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.FirstGame),
    );
  });
});
