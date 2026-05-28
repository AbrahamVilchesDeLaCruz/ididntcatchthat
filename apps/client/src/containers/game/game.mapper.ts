import type {
  FlashcardGameApiModel,
  GameSummaryApiModel,
  ResumeGameApiResponse,
} from './api/game.api-model';
import type {
  FlashcardGameVM,
  GameSummaryVM,
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
  accuracy: raw.accuracy,
  duration: raw.duration,
});

export const mapResumeGame = (raw: ResumeGameApiResponse): ResumeGameVM => ({
  gameId: raw.game.id,
  pendingFlashcardIds: raw.pendingFlashcardIds,
  lastFlashcardId: raw.game.lastFlashcardId,
});
