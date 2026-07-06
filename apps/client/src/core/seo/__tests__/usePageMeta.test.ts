import { createElement, type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { en } from '@/core/i18n/en';
import { es } from '@/core/i18n/es';
import { useI18n } from '@/core/i18n';
import { applyPageMeta, usePageMeta } from '../usePageMeta';

function withRoute(path: string) {
  return ({ children }: { children: ReactNode }): ReactNode =>
    createElement(MemoryRouter, { initialEntries: [path] }, children);
}

describe('applyPageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    useI18n.setState({ locale: 'en', t: en });
  });

  it('sets title, description, and canonical for the landing page', () => {
    applyPageMeta('/', 'en', en);

    expect(document.title).toBe(en.seo.pages.landing.title);
    expect(
      document.head
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    ).toBe(en.seo.pages.landing.description);
    expect(
      document.head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute('href'),
    ).toBe('https://ididntcatchthat.com/');
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute('content'),
    ).toBe('index, follow');
  });

  it('applies noindex and removes canonical for private app routes', () => {
    applyPageMeta('/home', 'en', en);

    expect(document.title).toBe(en.seo.pages.home.title);
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute('content'),
    ).toBe('noindex, nofollow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('updates og locale when UI locale changes', () => {
    applyPageMeta('/auth/login', 'es', es);

    expect(
      document.head
        .querySelector('meta[property="og:locale"]')
        ?.getAttribute('content'),
    ).toBe('es_ES');
    expect(
      document.head
        .querySelector('meta[property="og:locale:alternate"]')
        ?.getAttribute('content'),
    ).toBe('en_US');
  });
});

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    useI18n.setState({ locale: 'en', t: en });
  });

  it('syncs head tags for public game config route', () => {
    renderHook(() => usePageMeta(), { wrapper: withRoute('/game') });

    expect(document.title).toBe(en.seo.pages.gameConfig.title);
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute('content'),
    ).toBe('index, follow');
  });

  it('syncs head tags for active game sessions with noindex', () => {
    renderHook(() => usePageMeta(), {
      wrapper: withRoute('/game/session-id'),
    });

    expect(document.title).toBe(en.seo.pages.gameSession.title);
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute('content'),
    ).toBe('noindex, nofollow');
  });
});
