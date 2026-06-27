import { describe, it, expect } from 'vitest';
import { getExampleAudioUrl, getNativeAudioUrl } from '../game.audio';
import type { FlashcardGameVM } from '../game.types';

const audioUrls: NonNullable<FlashcardGameVM['audioUrls']> = {
  expression: { us: 'https://audio.test/us.mp3', uk: '', au: '' },
  examples: { us: 'https://audio.test/ex.mp3' },
};

describe('game.audio', () => {
  it('returns example audio url when present', () => {
    expect(getExampleAudioUrl(audioUrls)).toBe('https://audio.test/ex.mp3');
  });

  it('returns null for missing or empty urls', () => {
    expect(getExampleAudioUrl(null)).toBeNull();
    expect(
      getExampleAudioUrl({ ...audioUrls, examples: { us: '' } }),
    ).toBeNull();
    expect(
      getNativeAudioUrl({
        ...audioUrls,
        expression: { us: '', uk: '', au: '' },
      }),
    ).toBeNull();
  });

  it('returns native expression audio url when present', () => {
    expect(getNativeAudioUrl(audioUrls)).toBe('https://audio.test/us.mp3');
  });
});
