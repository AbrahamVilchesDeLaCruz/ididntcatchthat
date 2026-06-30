import { mock } from 'jest-mock-extended';
import { AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { type UserAchievementProgressRepository } from '@/achievement/progress/domain/user-achievement-progress.repository';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/progress/application/update AchievementProgressUpdater', () => {
  const repository = mock<UserAchievementProgressRepository>();
  let updater: AchievementProgressUpdater;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    updater = new AchievementProgressUpdater(repository);
  });

  it('should create and persist progress from game completed events', async () => {
    const userId = UserIdMother.random().value;
    repository.search.mockResolvedValue(null);

    const progress = await updater.applyGameCompleted({
      gameId: 'game-id',
      userId,
      mode: 'game',
      module: 'native_sounds',
      subcategory: null,
      source: 'catalog',
      cardCount: '10',
      correctCount: 10,
      totalCount: 10,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });

    expect(progress.completedGamesCount).toBe(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should increment total attempts from attempt recorded events', async () => {
    const userId = UserIdMother.random().value;
    repository.search.mockResolvedValue(
      UserAchievementProgress.fromPrimitives({
        userId,
        completedGamesCount: 0,
        completedStudySessionsCount: 0,
        totalPlayedAttempts: 99,
        touchedModules: [],
      }),
    );

    const progress = await updater.applyAttemptRecorded({
      gameId: 'game-id',
      userId,
      flashcardId: 'flashcard-id',
      flashcardModule: 'native_sounds',
      correct: true,
      mode: 'game',
      answeredAt: new Date().toISOString(),
    });

    expect(progress?.totalPlayedAttempts).toBe(100);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
