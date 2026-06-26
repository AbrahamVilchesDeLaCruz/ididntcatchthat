import { useI18n } from '@/core/i18n';
import type { Translations } from '@/core/i18n';

export type GamePlayLabels = Translations['game']['play'];

export const useGamePlayLabels = (): GamePlayLabels =>
  useI18n((state) => state.t.game.play);
