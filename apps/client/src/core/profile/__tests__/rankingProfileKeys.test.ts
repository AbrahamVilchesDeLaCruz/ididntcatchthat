import { describe, it, expect } from 'vitest';
import { rankingProfileKeys } from '../useRankingProfile';

describe('rankingProfileKeys', () => {
  it('incluye el userId en la queryKey — sin él TanStack cachearía datos de un usuario anterior en el mismo navegador', () => {
    const userA = 'user-aaa';
    const userB = 'user-bbb';

    const keyA = rankingProfileKeys.profile(userA);
    const keyB = rankingProfileKeys.profile(userB);

    expect(keyA).toContain(userA);
    expect(keyB).toContain(userB);
    expect(keyA).not.toEqual(keyB);
  });

  it('cada userId produce una key distinta (cache miss al cambiar de usuario)', () => {
    const a = rankingProfileKeys.profile(
      '11111111-1111-4111-8111-111111111111',
    );
    const b = rankingProfileKeys.profile(
      '22222222-2222-4222-8222-222222222222',
    );

    expect(a).not.toEqual(b);
    expect(a[0]).toBe('ranking');
    expect(a[1]).toBe('profile');
    expect(b[0]).toBe('ranking');
    expect(b[1]).toBe('profile');
  });
});
