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

// Tipos crudos que devuelve/recibe la API de content/flashcard
export interface FlashcardExampleApiModel {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
}

export interface FlashcardAudioUrlsApiModel {
  expression: { us: string; uk: string; au: string };
  examples: { us: string };
}

export interface FlashcardApiModel {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioStatus: 'pending' | 'generating' | 'ready' | 'failed';
  audioUrls: FlashcardAudioUrlsApiModel | null;
  examples: FlashcardExampleApiModel[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FlashcardsListApiModel {
  data: FlashcardApiModel[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFlashcardApiPayload {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples: FlashcardExampleApiModel[];
}

export interface BulkCreateFlashcardApiPayload {
  flashcards: CreateFlashcardApiPayload[];
}

export interface BulkCreateFlashcardApiResult {
  created: number;
  flashcards: FlashcardApiModel[];
}

export interface UpdateFlashcardApiPayload {
  expression?: string;
  meaning?: string;
  category?: string;
  subcategory?: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples?: FlashcardExampleApiModel[];
}

export interface SearchFlashcardsParams {
  category?: string;
  subcategory?: string;
  audioStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface FlashcardDraftExampleApiModel {
  textEn: string;
  textEs: string;
}

export interface FlashcardDraftApiModel {
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: FlashcardDraftExampleApiModel[];
}

export interface GenerateFlashcardsApiPayload {
  category: string;
  subcategory: string;
  count?: number;
  prompt?: string;
}

export interface GenerateFlashcardsApiResult {
  drafts: FlashcardDraftApiModel[];
}
