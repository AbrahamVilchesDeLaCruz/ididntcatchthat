import type {
  FlashcardGameApiModel,
  GameSummaryApiModel,
  PausedGameApiModel,
  ResumeGameApiResponse,
} from './api/game.api-model';
import type {
  FlashcardGameVM,
  GameSummaryVM,
  PausedGameVM,
  ResumeGameVM,
} from './game.types';

export const mapFlashcardForGame = (
  raw: FlashcardGameApiModel,
): FlashcardGameVM => ({
  id: raw.id,
  position: raw.position,
  expression: raw.expression,
  meaning: raw.meaning,
  ipaNotation: raw.ipaNotation,
  nativeSpeech: raw.nativeSpeech,
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
});

export const mapGameSummary = (raw: GameSummaryApiModel): GameSummaryVM => ({
  correctCount: raw.correctCount,
  totalCount: raw.totalCount,
  // API returns accuracy as 0–100; VM uses 0–1 for display helpers.
  accuracy: raw.accuracy / 100,
  duration: raw.duration,
  cardsViewed: raw.cardsViewed ?? raw.totalCount,
});

export const mapResumeGame = (raw: ResumeGameApiResponse): ResumeGameVM => ({
  gameId: raw.game.id,
  pendingFlashcardIds: raw.pendingFlashcardIds,
  lastFlashcardId: raw.game.lastFlashcardId,
});

export const mapPausedGame = (raw: PausedGameApiModel): PausedGameVM => ({
  gameId: raw.id,
  mode: raw.mode,
  module: raw.module,
  subcategory: raw.subcategory,
  cardCount: Number(raw.cardCount),
  startedAt: new Date(raw.startedAt),
  lastFlashcardId: raw.lastFlashcardId,
});
