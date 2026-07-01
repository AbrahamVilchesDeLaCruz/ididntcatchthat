import { mock } from 'jest-mock-extended';
import { AchievementProgressUpdater } from '@/achievement/progress/application/update/achievement-progress-updater';
import { type UserAchievementProgressRepository } from '@/achievement/progress/domain/user-achievement-progress.repository';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { type AttemptRecordedAttributes } from '@/gaming/domain/events/attempt-recorded.event';
import { type FlashcardViewedAttributes } from '@/gaming/domain/events/flashcard-viewed.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { AttemptRecordedEventMother } from '@test/gaming/domain/attempt-recorded-event-mother';
import { FlashcardViewedEventMother } from '@test/gaming/domain/flashcard-viewed-event-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';
import { GameModuleMother } from '@test/gaming/domain/game-module-mother';
import { CardCountMother } from '@test/gaming/domain/card-count-mother';

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
    const attrs = GameCompletedEventMother.random({
      userId,
      mode: GameModeMother.game().value,
      module: GameModuleMother.nativeSounds().value,
      cardCount: CardCountMother.ten().value,
      correctCount: 10,
      totalCount: 10,
    }).attributes as GameCompletedAttributes;

    const progress = await updater.applyGameCompleted(attrs);

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
    const attrs = AttemptRecordedEventMother.random({
      userId,
      correct: true,
      mode: GameModeMother.game().value,
    }).attributes as AttemptRecordedAttributes;

    const progress = await updater.applyAttemptRecorded(attrs);

    expect(progress?.totalPlayedAttempts).toBe(100);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should record study completion from game completed events', async () => {
    const userId = UserIdMother.random().value;
    repository.search.mockResolvedValue(null);
    const attrs = GameCompletedEventMother.random({
      userId,
      mode: GameModeMother.study().value,
      module: GameModuleMother.nativeSounds().value,
      cardCount: CardCountMother.ten().value,
      correctCount: 5,
      totalCount: 5,
    }).attributes as GameCompletedAttributes;

    const progress = await updater.applyGameCompleted(attrs);

    expect(progress.completedStudySessionsCount).toBe(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('should skip attempt recorded events for guest users', async () => {
    const attrs = AttemptRecordedEventMother.guest({
      correct: true,
      mode: GameModeMother.game().value,
    }).attributes as AttemptRecordedAttributes;

    const result = await updater.applyAttemptRecorded(attrs);

    expect(result).toBeNull();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should skip attempt recorded events outside game mode', async () => {
    const attrs = AttemptRecordedEventMother.random({
      mode: GameModeMother.study().value,
    }).attributes as AttemptRecordedAttributes;

    const result = await updater.applyAttemptRecorded(attrs);

    expect(result).toBeNull();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should skip flashcard viewed events for guest users', async () => {
    const attrs = FlashcardViewedEventMother.guest()
      .attributes as FlashcardViewedAttributes;

    const result = await updater.applyFlashcardViewed(attrs);

    expect(result).toBeNull();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should record studied module from flashcard viewed events', async () => {
    const userId = UserIdMother.random().value;
    const module = GameModuleMother.nativeSounds().value;
    repository.search.mockResolvedValue(null);
    const attrs = FlashcardViewedEventMother.random({
      userId,
      flashcardModule: module,
    }).attributes as FlashcardViewedAttributes;

    const progress = await updater.applyFlashcardViewed(attrs);

    expect(progress?.touchedModules).toContain(module);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
