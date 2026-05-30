import { Injectable } from '@nestjs/common';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { SUBCATEGORY_BY_CATEGORY } from '@/content/flashcard/domain/subcategory-enums';
import { type ResponseFlashcardCatalogQuerier } from './response-flashcard-catalog-querier';

export type { ResponseFlashcardCatalogQuerier } from './response-flashcard-catalog-querier';

@Injectable()
export class FlashcardCatalogQuerier {
  execute(): ResponseFlashcardCatalogQuerier {
    const categories = Object.values(CategoryValue).map((categoryValue) => ({
      value: categoryValue,
      subcategories: Array.from(SUBCATEGORY_BY_CATEGORY[categoryValue]),
    }));

    return { categories };
  }
}
