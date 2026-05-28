import { Injectable } from '@nestjs/common';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { SUBCATEGORY_BY_CATEGORY } from '@/content/flashcard/domain/subcategory-enums';

export type FlashcardCatalogCategory = {
  value: string;
  subcategories: string[];
};

export type FlashcardCatalog = {
  categories: FlashcardCatalogCategory[];
};

@Injectable()
export class FlashcardCatalogQuerier {
  execute(): FlashcardCatalog {
    const categories = Object.values(CategoryValue).map((categoryValue) => ({
      value: categoryValue,
      subcategories: Array.from(SUBCATEGORY_BY_CATEGORY[categoryValue]),
    }));

    return { categories };
  }
}
