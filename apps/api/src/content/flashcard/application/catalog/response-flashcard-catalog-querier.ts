export type FlashcardCatalogSubcategory = {
  value: string;
  label: { es: string; en: string };
  description: { es: string; en: string };
  anchorExamples: string[];
};

export type FlashcardCatalogCategory = {
  value: string;
  label: { es: string; en: string };
  subcategories: FlashcardCatalogSubcategory[];
};

export type ResponseFlashcardCatalogQuerier = {
  categories: FlashcardCatalogCategory[];
};
