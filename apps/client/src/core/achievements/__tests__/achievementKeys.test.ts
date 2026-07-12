import { describe, it, expect } from 'vitest';
import { achievementKeys } from '../achievementKeys';

describe('achievementKeys', () => {
  it('list() con since incluye el since (ya era así)', () => {
    const key = achievementKeys.list('user-1', '2026-01-01T00:00:00.000Z');
    expect(key).toContain('2026-01-01T00:00:00.000Z');
  });

  it('list() incluye el userId para evitar que TanStack sirva logros cacheados de un usuario anterior', () => {
    const userA = 'user-aaa';
    const userB = 'user-bbb';

    const keyA = achievementKeys.list(userA);
    const keyB = achievementKeys.list(userB);

    expect(keyA).toContain(userA);
    expect(keyB).toContain(userB);
    expect(keyA).not.toEqual(keyB);
  });

  it('all invalida cualquier userId (sigue siendo prefijo)', () => {
    expect(achievementKeys.all).toEqual(['achievements']);
    const keyA = achievementKeys.list('user-aaa');
    const keyB = achievementKeys.list('user-bbb', 'since');
    expect(keyA[0]).toBe('achievements');
    expect(keyB[0]).toBe('achievements');
  });
});
