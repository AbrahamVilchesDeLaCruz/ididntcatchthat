import { beforeEach, describe, expect, it } from 'vitest';
import { en } from '@/core/i18n/en';
import { es } from '@/core/i18n/es';
import { useI18n } from '@/core/i18n/i18n.store';

const resetStore = (): void => {
  useI18n.setState({ locale: 'en', t: en });
  document.documentElement.lang = 'en';
};

describe('i18n.store', () => {
  beforeEach(resetStore);

  it('setLocale updates translations and document lang', () => {
    useI18n.getState().setLocale('es');

    const state = useI18n.getState();
    expect(state.locale).toBe('es');
    expect(state.t).toBe(es);
    expect(document.documentElement.lang).toBe('es');
  });

  it('toggleLocale switches from en to es', () => {
    useI18n.getState().toggleLocale();

    const state = useI18n.getState();
    expect(state.locale).toBe('es');
    expect(state.t).toBe(es);
    expect(document.documentElement.lang).toBe('es');
  });

  it('toggleLocale switches from es back to en', () => {
    useI18n.setState({ locale: 'es', t: es });

    useI18n.getState().toggleLocale();

    const state = useI18n.getState();
    expect(state.locale).toBe('en');
    expect(state.t).toBe(en);
    expect(document.documentElement.lang).toBe('en');
  });
});
