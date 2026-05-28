import { mock } from 'jest-mock-extended';
import { type UserFlashcardStatsRepository } from '@/progress/domain/user-flashcard-stats.repository';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { UserFlashcardStatsMother } from '@test/progress/domain/user-flashcard-stats-mother';
import { RequestWeakestFlashcardSearcherMother } from './request-weakest-flashcard-searcher-mother';

describe('progress/application/search WeakestFlashcardSearcher', () => {
  const repository = mock<UserFlashcardStatsRepository>();
  let searcher: WeakestFlashcardSearcher;

  beforeEach(() => {
    repository.findWeakest.mockReset();
    searcher = new WeakestFlashcardSearcher(repository);
  });

  it('should return weakest flashcards for the user', async () => {
    const stats = [
      UserFlashcardStatsMother.withAccuracy(0.2),
      UserFlashcardStatsMother.withAccuracy(0.4),
    ];
    repository.findWeakest.mockResolvedValue(stats);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.random(),
    );

    expect(result).toHaveLength(2);
    expect(result[0].accuracyRate).toBe(0.2);
    expect(result[1].accuracyRate).toBe(0.4);
  });

  it('should use default limit of 10 when not provided', async () => {
    repository.findWeakest.mockResolvedValue([]);

    await searcher.execute(RequestWeakestFlashcardSearcherMother.random());

    expect(repository.findWeakest).toHaveBeenCalledWith(expect.anything(), 10);
  });

  it('should cap limit to 50 when exceeds max', async () => {
    repository.findWeakest.mockResolvedValue([]);

    await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withLimit(200),
    );

    expect(repository.findWeakest).toHaveBeenCalledWith(expect.anything(), 50);
  });

  it('should use provided limit when within bounds', async () => {
    repository.findWeakest.mockResolvedValue([]);

    await searcher.execute(RequestWeakestFlashcardSearcherMother.withLimit(25));

    expect(repository.findWeakest).toHaveBeenCalledWith(expect.anything(), 25);
  });

  it('should return empty array when user has no stats', async () => {
    repository.findWeakest.mockResolvedValue([]);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.random(),
    );

    expect(result).toEqual([]);
  });
});
