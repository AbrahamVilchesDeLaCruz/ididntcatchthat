import { LEARNING_MODULES } from '@/shared/domain/learning-module';
import { SUBCATEGORY_BY_CATEGORY } from '@/shared/domain/subcategory-taxonomy';
import { SUBCATEGORY_META } from '@/content/flashcard/domain/subcategory-catalog';

function sortedKeys(keys: readonly string[]): string[] {
  return [...keys].sort();
}

describe('shared/domain/subcategory-taxonomy parity', () => {
  const taxonomySlugs = sortedKeys(
    LEARNING_MODULES.flatMap((module) => [...SUBCATEGORY_BY_CATEGORY[module]]),
  );

  it('should expose metadata for every taxonomy slug', () => {
    expect(sortedKeys(Object.keys(SUBCATEGORY_META))).toEqual(taxonomySlugs);
  });

  it('should not define metadata for unknown slugs', () => {
    for (const slug of Object.keys(SUBCATEGORY_META)) {
      expect(taxonomySlugs).toContain(slug);
    }
  });
});
