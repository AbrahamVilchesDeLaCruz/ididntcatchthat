// Tipos crudos que devuelve/recibe la API de content/flashcard
export interface FlashcardExampleApiModel {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
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
  examples: FlashcardExampleApiModel[];
  createdAt: string;
  updatedAt: string;
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
