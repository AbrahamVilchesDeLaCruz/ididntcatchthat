import { mock } from 'jest-mock-extended';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { MasteringSoundsSubcategory } from '@/content/flashcard/domain/subcategory-enums';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';

describe('content/flashcard/application/search FlashcardSearcher', () => {
  const repository = mock<FlashcardRepository>();
  let searcher: FlashcardSearcher;

  beforeEach(() => {
    repository.match.mockReset();
    repository.count.mockReset();
    searcher = new FlashcardSearcher(repository);
  });

  it('should return paginated result with total', async () => {
    const flashcards = [FlashcardMother.random(), FlashcardMother.random()];
    repository.match.mockResolvedValue(flashcards);
    repository.count.mockResolvedValue(10);

    const result = await searcher.execute({
      page: 1,
      pageSize: 2,
    });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(2);
  });

  it('should filter by category when provided', async () => {
    const flashcards = [
      FlashcardMother.random({ category: CategoryValue.MasteringSounds }),
    ];
    repository.match.mockResolvedValue(flashcards);
    repository.count.mockResolvedValue(1);

    const result = await searcher.execute({
      category: CategoryValue.MasteringSounds,
      page: 1,
      pageSize: 10,
    });

    expect(result.data[0].category).toBe(CategoryValue.MasteringSounds);

    const criteria = repository.match.mock.calls[0][0];
    const categoryFilter = criteria.filters.find((f) => f.field === 'category');
    expect(categoryFilter).toBeDefined();
    expect(categoryFilter?.value).toBe(CategoryValue.MasteringSounds);
  });

  it('should apply page and pageSize to criteria', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    await searcher.execute({ page: 2, pageSize: 5 });

    const criteria = repository.match.mock.calls[0][0];
    expect(criteria.limit).toBe(5);
    expect(criteria.offset).toBe(5); // (page-1) * pageSize
  });

  it('should filter by subcategory when provided', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    await searcher.execute({
      subcategory: MasteringSoundsSubcategory.FLAP_T_PARTY_CITY,
      page: 1,
      pageSize: 10,
    });

    const criteria = repository.match.mock.calls[0][0];
    const subcategoryFilter = criteria.filters.find(
      (f) => f.field === 'subcategory',
    );
    expect(subcategoryFilter?.value).toBe(
      MasteringSoundsSubcategory.FLAP_T_PARTY_CITY,
    );
  });

  it('should use default page=1 and pageSize=20 when not provided', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    const result = await searcher.execute({});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    const criteria = repository.match.mock.calls[0][0];
    expect(criteria.limit).toBe(20);
    expect(criteria.offset).toBe(0);
  });

  it('should filter by audioStatus when provided', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    await searcher.execute({
      audioStatus: AudioStatusValue.Ready,
      page: 1,
      pageSize: 10,
    });

    const criteria = repository.match.mock.calls[0][0];
    const statusFilter = criteria.filters.find(
      (f) => f.field === 'audioStatus',
    );
    expect(statusFilter?.value).toBe(AudioStatusValue.Ready);
  });
});
