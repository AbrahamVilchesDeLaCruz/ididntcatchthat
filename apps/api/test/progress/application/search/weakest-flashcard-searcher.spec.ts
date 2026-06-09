import { mock } from 'jest-mock-extended';
import { type WeakestFlashcardQuery } from '@/progress/domain/weakest-flashcard.query';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { RequestWeakestFlashcardSearcherMother } from './request-weakest-flashcard-searcher-mother';

describe('progress/application/search WeakestFlashcardSearcher', () => {
  const query = mock<WeakestFlashcardQuery>();
  let searcher: WeakestFlashcardSearcher;

  beforeEach(() => {
    query.findWeakest.mockReset();
    searcher = new WeakestFlashcardSearcher(query);
  });

  it('should return weakest flashcards for the user', async () => {
    const weakest = [
      {
        flashcardId: 'fc-1',
        expression: 'gonna',
        module: 'connected_speech',
        errorCount: 8,
        lastSeenAt: '2026-01-01T00:00:00.000Z',
      },
      {
        flashcardId: 'fc-2',
        expression: 'wanna',
        module: 'connected_speech',
        errorCount: 5,
        lastSeenAt: '2026-01-02T00:00:00.000Z',
      },
    ];
    query.findWeakest.mockResolvedValue(weakest);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.random(),
    );

    expect(result).toEqual(weakest);
  });

  it('should use default limit of 10 when not provided', async () => {
    query.findWeakest.mockResolvedValue([]);

    await searcher.execute(RequestWeakestFlashcardSearcherMother.random());

    expect(query.findWeakest).toHaveBeenCalledWith(expect.anything(), 10);
  });

  it('should cap limit to 50 when exceeds max', async () => {
    query.findWeakest.mockResolvedValue([]);

    await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withLimit(200),
    );

    expect(query.findWeakest).toHaveBeenCalledWith(expect.anything(), 50);
  });

  it('should use provided limit when within bounds', async () => {
    query.findWeakest.mockResolvedValue([]);

    await searcher.execute(RequestWeakestFlashcardSearcherMother.withLimit(25));

    expect(query.findWeakest).toHaveBeenCalledWith(expect.anything(), 25);
  });

  it('should return empty array when user has no stats', async () => {
    query.findWeakest.mockResolvedValue([]);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.random(),
    );

    expect(result).toEqual([]);
  });
});
