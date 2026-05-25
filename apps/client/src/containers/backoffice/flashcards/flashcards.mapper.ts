import type {
  FlashcardApiModel,
  FlashcardsListApiModel,
} from './api/flashcards.api-model';
import type { FlashcardVM, FlashcardsPageVM } from './flashcards.types';

export const mapFlashcard = (raw: FlashcardApiModel): FlashcardVM => ({
  id: raw.id,
  expression: raw.expression,
  meaning: raw.meaning,
  category: raw.category,
  subcategory: raw.subcategory,
  ipaNotation: raw.ipaNotation,
  nativeSpeech: raw.nativeSpeech,
  audioStatus: raw.audioStatus,
  examples: raw.examples.map((ex) => ({
    id: ex.id,
    textEn: ex.textEn,
    textEs: ex.textEs,
    position: ex.position,
  })),
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
});

export const mapFlashcardsPage = (
  raw: FlashcardsListApiModel,
): FlashcardsPageVM => ({
  items: raw.data.map(mapFlashcard),
  total: raw.total,
  page: raw.page,
  pageSize: raw.pageSize,
});
