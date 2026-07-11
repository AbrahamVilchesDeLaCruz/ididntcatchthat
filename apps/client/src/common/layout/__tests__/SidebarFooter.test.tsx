import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import { useRankingProfile } from '@/core/profile/useRankingProfile';
import { useLogout } from '@/containers/auth/api';
import { redirectToLanding } from '@/core/auth/redirectToLanding';
import { SidebarFooter } from '../SidebarFooter';

vi.mock('@/containers/auth/api', () => ({
  useLogout: vi.fn(),
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

vi.mock('@/core/auth/redirectToLanding', () => ({
  redirectToLanding: vi.fn(),
  LANDING_PATH: '/',
}));

const mockedUseRankingProfile = vi.mocked(useRankingProfile);
const mockedRedirect = vi.mocked(redirectToLanding);
const mockedUseLogout = vi.mocked(useLogout);

const makeLogoutMutate =
  () =>
  (
    _args: unknown,
    options?: {
      onSettled?: () => void;
    },
  ): void => {
    options?.onSettled?.();
  };

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
    mockedUseLogout.mockReturnValue({
      mutate: vi.fn(makeLogoutMutate()),
    } as never);
    mockedRedirect.mockClear();
  });

  it('links profile block to /profile', () => {
    render(
      <MemoryRouter>
        <SidebarFooter />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ace/i })).toHaveAttribute(
      'href',
      '/profile',
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

  it('marca isLogoutPending=true en el store al pulsar logout (AppShell se encarga del redirect)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SidebarFooter />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /log out/i }));

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLogoutPending).toBe(true);
  });

  it('NO llama redirectToLanding directamente (el guard de AppShell lo hace)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SidebarFooter />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
