import { mock } from 'jest-mock-extended';
import { type WeakestFlashcardQuery } from '@/progress/domain/weakest-flashcard.query';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { RequestWeakestFlashcardSearcherMother } from './request-weakest-flashcard-searcher-mother';

describe('progress/application/search WeakestFlashcardSearcher', () => {
  const query = mock<WeakestFlashcardQuery>();
  let searcher: WeakestFlashcardSearcher;

  beforeEach(() => {
    query.findWeakest.mockReset();
    query.countWeakest.mockReset();
    searcher = new WeakestFlashcardSearcher(query);
  });

  it('should return paginated result with data + total + page + pageSize', async () => {
    const weakest = [
      {
        flashcardId: 'fc-1',
        expression: 'gonna',
        module: 'connected_speech',
        category: 'connected_speech',
        subcategory: 'informal_going_to',
        errorCount: 8,
        lastSeenAt: '2026-01-01T00:00:00.000Z',
      },
      {
        flashcardId: 'fc-2',
        expression: 'wanna',
        module: 'connected_speech',
        category: 'connected_speech',
        subcategory: 'informal_going_to',
        errorCount: 5,
        lastSeenAt: '2026-01-02T00:00:00.000Z',
      },
    ];
    query.findWeakest.mockResolvedValue(weakest);
    query.countWeakest.mockResolvedValue(42);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withPageAndSize(1, 10),
    );

    expect(result.data).toEqual(weakest);
    expect(result.total).toBe(42);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(5); // ceil(42/10)
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(false);
  });

  it('should call findWeakest with limit = pageSize and offset = (page-1)*pageSize', async () => {
    query.findWeakest.mockResolvedValue([]);
    query.countWeakest.mockResolvedValue(0);

    await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withPageAndSize(3, 20),
    );

    expect(query.findWeakest).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      20,
      40, // offset: (3-1) * 20
    );
  });

  it('should use default page=1 and pageSize=10 when not provided', async () => {
    query.findWeakest.mockResolvedValue([]);
    query.countWeakest.mockResolvedValue(0);

    await searcher.execute(RequestWeakestFlashcardSearcherMother.random());

    expect(query.findWeakest).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      10,
      0,
    );
  });

  it('should cap pageSize to 50 when exceeds max', async () => {
    query.findWeakest.mockResolvedValue([]);
    query.countWeakest.mockResolvedValue(0);

    await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withPageAndSize(1, 200),
    );

    expect(query.findWeakest).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      50,
      0,
    );
  });

  it('should compute hasNextPage=false and hasPrevPage=true on the last page', async () => {
    query.findWeakest.mockResolvedValue([]);
    query.countWeakest.mockResolvedValue(25);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withPageAndSize(3, 10),
    );

    expect(result.totalPages).toBe(3); // ceil(25/10)
    expect(result.page).toBe(3);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
  });

  it('should return single empty page when total is 0', async () => {
    query.findWeakest.mockResolvedValue([]);
    query.countWeakest.mockResolvedValue(0);

    const result = await searcher.execute(
      RequestWeakestFlashcardSearcherMother.withPageAndSize(1, 10),
    );

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });
});
