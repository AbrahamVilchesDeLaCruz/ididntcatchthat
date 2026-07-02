import { describe, expect, it } from 'vitest';
import { NATIVE_SOUND_TOPIC_COUNT } from '@/core/content/nativeSoundsCatalog';

describe('nativeSoundsCatalog', () => {
  it('matches NativeSoundsSubcategory enum size in API taxonomy', () => {
    expect(NATIVE_SOUND_TOPIC_COUNT).toBe(45);
  });
});
