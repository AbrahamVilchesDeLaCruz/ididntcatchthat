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
  audioUrls: raw.audioUrls
    ? {
        expression: {
          us: raw.audioUrls.expression.us,
          uk: raw.audioUrls.expression.uk,
          au: raw.audioUrls.expression.au,
        },
        examples: { us: raw.audioUrls.examples.us },
      }
    : null,
  examples: raw.examples.map((ex) => ({
    id: ex.id,
    textEn: ex.textEn,
    textEs: ex.textEs,
    position: ex.position,
  })),
  createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(0),
  updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(0),
});

export const mapFlashcardsPage = (
  raw: FlashcardsListApiModel,
): FlashcardsPageVM => ({
  items: raw.data.map(mapFlashcard),
  total: raw.pagination.total_items,
  page: raw.pagination.page,
  pageSize: raw.pagination.limit,
});
