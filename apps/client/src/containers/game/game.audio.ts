import type { FlashcardGameVM } from './game.types';

export const getExampleAudioUrl = (
  audioUrls: FlashcardGameVM['audioUrls'],
): string | null => {
  if (audioUrls === null) return null;
  const url = audioUrls.examples.us;
  return url.length > 0 ? url : null;
};

export const getNativeAudioUrl = (
  audioUrls: FlashcardGameVM['audioUrls'],
): string | null => {
  if (audioUrls === null) return null;
  const url = audioUrls.expression.us;
  return url.length > 0 ? url : null;
};
