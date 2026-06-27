export interface LocalizedLabelApiModel {
  es: string;
  en: string;
}

export interface FlashcardCatalogSubcategoryApiModel {
  value: string;
  label: LocalizedLabelApiModel;
  description: LocalizedLabelApiModel;
  anchorExamples: string[];
}

export interface FlashcardCatalogCategoryApiModel {
  value: string;
  label: LocalizedLabelApiModel;
  subcategories: FlashcardCatalogSubcategoryApiModel[];
}

export interface FlashcardCatalogApiModel {
  categories: FlashcardCatalogCategoryApiModel[];
}
