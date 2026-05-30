import { type RequestUpdateFlashcardStats } from '@/progress/application/update/update-flashcard-stats';
import { mock } from 'jest-mock-extended';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { UpdateFlashcardStats } from '@/progress/application/update/update-flashcard-stats';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';
import { ProgressFlashcardIdMother } from '@test/progress/domain/progress-flashcard-id-mother';

describe('progress/application/update UpdateFlashcardStats', () => {
  const repository = mock<UserFlashcardStatsRepository>();
  let useCase: UpdateFlashcardStats;

  const makeRequest = (overrides?: {
    mode?: string;
    correct?: boolean;
  }): RequestUpdateFlashcardStats => ({
    userId: ProgressUserIdMother.random().value,
    flashcardId: ProgressFlashcardIdMother.random().value,
    correct: overrides?.correct ?? true,
    mode: overrides?.mode ?? 'game',
  });

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    repository.save.mockResolvedValue(undefined);
    useCase = new UpdateFlashcardStats(repository);
  });

  it('should create and save new stats when none exist', async () => {
    repository.search.mockResolvedValue(null);

    await useCase.execute(makeRequest({ mode: 'game', correct: true }));

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBe(1);
    expect(saved.correctCount).toBe(1);
  });

  it('should update existing stats when found', async () => {
    const existing = UserFlashcardStatsMother.withAccuracy(0.5);
    const previousTimesPlayed = existing.timesPlayed;
    repository.search.mockResolvedValue(existing);

    await useCase.execute(makeRequest({ mode: 'game', correct: false }));

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.timesPlayed).toBe(previousTimesPlayed + 1);
  });

  it('should call recordStudy when mode is study', async () => {
    repository.search.mockResolvedValue(null);

    await useCase.execute(makeRequest({ mode: 'study', correct: true }));

    const saved = repository.save.mock.calls[0][0];
    expect(saved.timesStudied).toBe(1);
    expect(saved.timesPlayed).toBe(0);
  });

  it('should not affect correctCount or accuracyRate when mode is study', async () => {
    repository.search.mockResolvedValue(null);

    await useCase.execute(makeRequest({ mode: 'study', correct: true }));

    const saved = repository.save.mock.calls[0][0];
    expect(saved.correctCount).toBe(0);
    expect(saved.accuracyRate).toBe(0);
  });

  it('should not produce accuracyRate > 1 when mixing study-correct and game-incorrect', async () => {
    // study: 10 correct → correctCount must stay 0
    // game: 1 incorrect → timesPlayed=1, correctCount=0, accuracyRate=0
    const existing = UserFlashcardStatsMother.create({
      timesStudied: 10,
      timesPlayed: 0,
      correctCount: 0,
      accuracyRate: 0,
    });
    repository.search.mockResolvedValue(existing);

    await useCase.execute(makeRequest({ mode: 'game', correct: false }));

    const saved = repository.save.mock.calls[0][0];
    expect(saved.accuracyRate).toBeGreaterThanOrEqual(0);
    expect(saved.accuracyRate).toBeLessThanOrEqual(1);
  });
});
