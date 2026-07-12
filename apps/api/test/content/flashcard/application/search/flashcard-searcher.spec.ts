import { mock } from 'jest-mock-extended';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { NativeSoundsSubcategory } from '@/shared/domain/subcategory-taxonomy';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';

describe('content/flashcard/application/search FlashcardSearcher', () => {
  const repository = mock<FlashcardRepository>();
  let searcher: FlashcardSearcher;

  beforeEach(() => {
    repository.match.mockReset();
    repository.count.mockReset();
    searcher = new FlashcardSearcher(repository);
  });

  it('should filter in-memory when query is provided (matches expression)', async () => {
    const catching = FlashcardMother.randomPrimitives({
      expression: 'catch up',
      meaning: 'ponerse al día',
    });
    const other = FlashcardMother.randomPrimitives({
      expression: 'figure out',
      meaning: 'resolver',
    });
    repository.match.mockResolvedValue([
      FlashcardMother.random(catching),
      FlashcardMother.random(other),
    ]);

    const result = await searcher.execute({
      query: 'catch',
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].expression).toBe('catch up');
    expect(result.total).toBe(1);
  });

  it('should filter in-memory when query matches meaning', async () => {
    const catching = FlashcardMother.randomPrimitives({
      expression: 'catch up',
      meaning: 'ponerse al día',
    });
    const other = FlashcardMother.randomPrimitives({
      expression: 'figure out',
      meaning: 'resolver',
    });
    repository.match.mockResolvedValue([
      FlashcardMother.random(catching),
      FlashcardMother.random(other),
    ]);

    const result = await searcher.execute({
      query: 'al día',
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].meaning).toBe('ponerse al día');
  });

  it('should match query case-insensitively', async () => {
    const target = FlashcardMother.randomPrimitives({
      expression: 'Catch Up',
      meaning: 'ponerse al día',
    });
    const other = FlashcardMother.randomPrimitives({
      expression: 'figure out',
      meaning: 'resolver',
    });
    repository.match.mockResolvedValue([
      FlashcardMother.random(target),
      FlashcardMother.random(other),
    ]);

    const result = await searcher.execute({
      query: 'CATCH',
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].expression).toBe('Catch Up');
  });

  it('should AND-compose query with category filter via DB match', async () => {
    repository.match.mockResolvedValue([]);

    await searcher.execute({
      query: 'catch',
      category: CategoryValue.NativeSounds,
      page: 1,
      pageSize: 20,
    });

    const criteria = repository.match.mock.calls[0][0];
    const categoryFilter = criteria.filters.find((f) => f.field === 'category');
    expect(categoryFilter?.value).toBe(CategoryValue.NativeSounds);
    // No limit/offset when searching by query — pagination happens in-memory
    expect(criteria.limit).toBeNull();
    expect(criteria.offset).toBeNull();
  });

  it('should use DB-level pagination when query is undefined', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    await searcher.execute({ page: 2, pageSize: 5 });

    const criteria = repository.match.mock.calls[0][0];
    expect(criteria.limit).toBe(5);
    expect(criteria.offset).toBe(5);
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
      FlashcardMother.random({ category: CategoryValue.NativeSounds }),
    ];
    repository.match.mockResolvedValue(flashcards);
    repository.count.mockResolvedValue(1);

    const result = await searcher.execute({
      category: CategoryValue.NativeSounds,
      page: 1,
      pageSize: 10,
    });

    expect(result.data[0].category).toBe(CategoryValue.NativeSounds);

    const criteria = repository.match.mock.calls[0][0];
    const categoryFilter = criteria.filters.find((f) => f.field === 'category');
    expect(categoryFilter).toBeDefined();
    expect(categoryFilter?.value).toBe(CategoryValue.NativeSounds);
  });

  it('should apply page and pageSize to criteria', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    await searcher.execute({ page: 2, pageSize: 5 });

    const criteria = repository.match.mock.calls[0][0];
    expect(criteria.limit).toBe(5);
    expect(criteria.offset).toBe(5);
  });

  it('should filter by subcategory when provided', async () => {
    repository.match.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);

    await searcher.execute({
      subcategory: NativeSoundsSubcategory.VVacation,
      page: 1,
      pageSize: 10,
    });

    const criteria = repository.match.mock.calls[0][0];
    const subcategoryFilter = criteria.filters.find(
      (f) => f.field === 'subcategory',
    );
    expect(subcategoryFilter?.value).toBe(NativeSoundsSubcategory.VVacation);
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
