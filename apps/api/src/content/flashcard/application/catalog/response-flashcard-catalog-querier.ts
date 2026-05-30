export type FlashcardCatalogCategory = {
  value: string;
  subcategories: string[];
};

export type ResponseFlashcardCatalogQuerier = {
  categories: FlashcardCatalogCategory[];
};
