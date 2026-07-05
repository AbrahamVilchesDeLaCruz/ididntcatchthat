import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import { scrollToLandingSection } from '@/containers/landing/landingScroll';
import { LandingHeader } from '../LandingHeader';

vi.mock('@/containers/landing/landingScroll', () => ({
  scrollToLandingSection: vi.fn(),
}));

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
    vi.mocked(scrollToLandingSection).mockClear();
  });

  it('renders section links for desktop and mobile navigation', () => {
    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole('link', { name: en.landing.header.explore }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole('link', { name: en.landing.header.start }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: en.landing.hero.navRegister }),
    ).toBeInTheDocument();
  });

  it('shows the app link for authenticated users', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: en.home.navApp })).toHaveAttribute(
      'href',
      '/home',
    );
    expect(
      screen.queryByRole('link', { name: en.landing.hero.navRegister }),
    ).not.toBeInTheDocument();
  });

  it('scrolls to landing sections when nav links are clicked', () => {
    render(
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getAllByRole('link', { name: en.landing.header.explore })[0],
    );

    expect(scrollToLandingSection).toHaveBeenCalledWith('how-it-works');
  });
});
