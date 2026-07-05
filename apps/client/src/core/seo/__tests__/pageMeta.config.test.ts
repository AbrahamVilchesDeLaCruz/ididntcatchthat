import { describe, expect, it } from 'vitest';
import { buildCanonicalUrl, resolvePageMetaKey } from '../pageMeta.config';

describe('resolvePageMetaKey', () => {
  it('maps public marketing and auth routes', () => {
    expect(resolvePageMetaKey('/')).toBe('landing');
    expect(resolvePageMetaKey('/auth/login')).toBe('authLogin');
    expect(resolvePageMetaKey('/auth/register')).toBe('authRegister');
    expect(resolvePageMetaKey('/game')).toBe('gameConfig');
    expect(resolvePageMetaKey('/study')).toBe('studyConfig');
  });

  it('maps private app and session routes to noindex keys', () => {
    expect(resolvePageMetaKey('/home')).toBe('home');
    expect(resolvePageMetaKey('/stats')).toBe('stats');
    expect(resolvePageMetaKey('/game/abc-123')).toBe('gameSession');
    expect(resolvePageMetaKey('/study/session-1')).toBe('studySession');
    expect(resolvePageMetaKey('/auth/callback')).toBe('authCallback');
    expect(resolvePageMetaKey('/backoffice/games')).toBe('backoffice');
  });

  it('falls back to notFound for unknown paths', () => {
    expect(resolvePageMetaKey('/unknown-path')).toBe('notFound');
  });
});

describe('buildCanonicalUrl', () => {
  it('builds absolute URLs from pathname', () => {
    expect(buildCanonicalUrl('/auth/login')).toBe(
      'https://ididntcatchthat.com/auth/login',
    );
  });
});
