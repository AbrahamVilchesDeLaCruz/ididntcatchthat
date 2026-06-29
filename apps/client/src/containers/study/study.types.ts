import type { GameModule } from '@/containers/game/api/game.api-model';

export type StartStudyPayload = {
  mode: 'study';
  module?: GameModule | null;
  subcategory?: string | null;
  cardCount: 10 | 20 | 50;
};

export type RecordViewPayload = {
  flashcardId: string;
};

export type StudySummaryVM = {
  cardsViewed: number;
  totalCount: number;
  duration: number;
};
