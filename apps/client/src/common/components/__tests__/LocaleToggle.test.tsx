import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { en } from '@/core/i18n/en';
import { es } from '@/core/i18n/es';
import { useI18n } from '@/core/i18n';
import { LocaleToggle } from '../LocaleToggle';

describe('LocaleToggle', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('pill variant switches to Spanish', () => {
    render(<LocaleToggle variant="pill" />);

    fireEvent.click(screen.getByRole('button', { name: 'ES' }));

    expect(useI18n.getState().locale).toBe('es');
    expect(useI18n.getState().t).toBe(es);
  });

  it('pill variant switches to English', () => {
    useI18n.setState({ locale: 'es', t: es });
    render(<LocaleToggle variant="pill" />);

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(useI18n.getState().locale).toBe('en');
  });

  it('icon variant toggles locale on click', () => {
    render(<LocaleToggle variant="icon" />);

    fireEvent.click(
      screen.getByRole('button', { name: en.common.locale.switchLanguage }),
    );

    expect(useI18n.getState().locale).toBe('es');
  });
});
