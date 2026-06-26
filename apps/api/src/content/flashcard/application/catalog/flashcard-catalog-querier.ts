import { Injectable } from '@nestjs/common';
import {
  LEARNING_MODULE_LABELS,
  LEARNING_MODULES,
} from '@/shared/domain/learning-module';
import {
  SUBCATEGORY_BY_CATEGORY,
  SUBCATEGORY_META,
} from '@/content/flashcard/domain/subcategory-catalog';
import { type ResponseFlashcardCatalogQuerier } from './response-flashcard-catalog-querier';

export type { ResponseFlashcardCatalogQuerier } from './response-flashcard-catalog-querier';

@Injectable()
export class FlashcardCatalogQuerier {
  execute(): ResponseFlashcardCatalogQuerier {
    const categories = LEARNING_MODULES.map((moduleValue) => {
      const subcategorySlugs = Array.from(SUBCATEGORY_BY_CATEGORY[moduleValue]);

      return {
        value: moduleValue,
        label: LEARNING_MODULE_LABELS[moduleValue],
        subcategories: subcategorySlugs.map((slug) => {
          const meta = SUBCATEGORY_META[slug];
          return {
            value: slug,
            label: meta?.label ?? { es: slug, en: slug },
            description: meta?.description ?? { es: '', en: '' },
            anchorExamples: meta?.anchorExamples ?? [],
          };
        }),
      };
    });

    return { categories };
  }
}
