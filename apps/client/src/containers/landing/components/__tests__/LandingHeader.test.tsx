import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import { LandingHeader } from '../LandingHeader';

vi.mock('@/common/components/ThemeToggle', () => ({
  ThemeToggle: () => <div>Theme toggle</div>,
}));

vi.mock('@/common/components/LocaleToggle', () => ({
  LocaleToggle: () => <div>Locale toggle</div>,
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    useAuthStore.setState({ isAuthenticated: false });
  });

  it('renders centered section links on md+ layout markup', () => {
    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: en.landing.header.explore }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: en.landing.header.start }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: en.landing.hero.navRegister }),
    ).toBeInTheDocument();
  });
});
