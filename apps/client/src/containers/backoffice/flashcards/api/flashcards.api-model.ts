export type {
  FlashcardCatalogApiModel,
  FlashcardCatalogCategoryApiModel,
  FlashcardCatalogSubcategoryApiModel,
  LocalizedLabelApiModel,
} from '@/core/api/flashcard-catalog.api-model';

import type { PaginatedApiEnvelope } from '@/core/api/api-envelope';

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

export type FlashcardsListApiModel = PaginatedApiEnvelope<FlashcardApiModel>;

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

export type BulkRegeneratableAudioStatus = 'pending' | 'failed';

export interface RegenerateFlashcardAudioBulkApiPayload {
  audioStatus: BulkRegeneratableAudioStatus;
  category?: string;
  subcategory?: string;
  page: number;
  pageSize: number;
}

export interface RegenerateFlashcardAudioBulkApiResult {
  triggered: number;
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
