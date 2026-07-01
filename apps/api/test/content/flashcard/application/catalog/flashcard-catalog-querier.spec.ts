import { FlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/flashcard-catalog-querier';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { SUBCATEGORY_BY_CATEGORY } from '@/shared/domain/subcategory-taxonomy';
import { LearningModule } from '@/shared/domain/learning-module';

describe('content/flashcard/application/catalog FlashcardCatalogQuerier', () => {
  let querier: FlashcardCatalogQuerier;

  beforeEach(() => {
    querier = new FlashcardCatalogQuerier();
  });

  it('should return all 4 categories', () => {
    const catalog = querier.execute();

    expect(catalog.categories).toHaveLength(4);
  });

  it('should include all LearningModule values', () => {
    const catalog = querier.execute();
    const values = catalog.categories.map((c) => c.value);

    expect(values).toEqual(
      expect.arrayContaining(Object.values(CategoryValue)),
    );
  });

  it('should return correct subcategories for each category', () => {
    const catalog = querier.execute();

    for (const category of catalog.categories) {
      const expected = Array.from(
        SUBCATEGORY_BY_CATEGORY[category.value as LearningModule],
      );
      const actual = category.subcategories.map((s) => s.value);
      expect(actual).toEqual(expected);
    }
  });

  it('should return labels and anchorExamples for subcategories', () => {
    const catalog = querier.execute();
    const nativeSounds = catalog.categories.find(
      (c) => (c.value as LearningModule) === LearningModule.NativeSounds,
    );
    const flap = nativeSounds?.subcategories.find(
      (s) => s.value === 'v_vacation',
    );

    expect(flap?.label.es).toBe('V de vacation');
    expect(flap?.anchorExamples.length).toBeGreaterThan(0);
  });

  it('should return non-empty subcategories for every category', () => {
    const catalog = querier.execute();

    for (const category of catalog.categories) {
      expect(category.subcategories.length).toBeGreaterThan(0);
    }
  });
});
