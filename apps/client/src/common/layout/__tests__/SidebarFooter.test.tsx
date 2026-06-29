import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import { useRankingProfile } from '@/core/profile/useRankingProfile';
import { SidebarFooter } from '../SidebarFooter';

vi.mock('@/containers/auth/api', () => ({
  useLogout: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/common/components/ThemeToggle', () => ({
  ThemeToggle: () => <div>Theme toggle</div>,
}));

vi.mock('@/common/components/LocaleToggle', () => ({
  LocaleToggle: () => <div>Locale toggle</div>,
}));

vi.mock('@/core/profile/useRankingProfile', () => ({
  useRankingProfile: vi.fn(),
}));

vi.mock('@/core/auth/useCurrentUser', () => ({
  useCurrentUser: vi.fn(() => ({
    isUser: true,
    isTeacher: false,
    isAdmin: false,
  })),
}));

const mockedUseRankingProfile = vi.mocked(useRankingProfile);

describe('SidebarFooter', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    useAuthStore.setState({
      isAuthenticated: true,
      userType: 'user',
      userId: 'u-1',
    });
    mockedUseRankingProfile.mockReturnValue({
      data: { nickname: 'Ace', showInRanking: true },
      isLoading: false,
    } as ReturnType<typeof useRankingProfile>);
  });

  it('links profile block to /profile', () => {
    render(
      <MemoryRouter>
        <SidebarFooter />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ace/i })).toHaveAttribute(
      'href',
      '/profile#ranking',
    );
  });

  it('renders logout control', () => {
    render(
      <MemoryRouter>
        <SidebarFooter />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /log out/i }),
    ).toBeInTheDocument();
  });
});
