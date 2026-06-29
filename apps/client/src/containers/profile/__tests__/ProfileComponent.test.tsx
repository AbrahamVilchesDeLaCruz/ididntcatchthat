import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileComponent } from '../ProfileComponent';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

vi.mock('@/core/auth/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('../components/ProfileAccountSection', () => ({
  ProfileAccountSection: () => <div>Account section</div>,
}));

vi.mock('../components/ProfileRankingSection', () => ({
  ProfileRankingSection: () => <div>Ranking section</div>,
}));

vi.mock('../components/ProfilePreferencesSection', () => ({
  ProfilePreferencesSection: () => <div>Preferences section</div>,
}));

const mockedUseCurrentUser = vi.mocked(useCurrentUser);

describe('ProfileComponent', () => {
  it('shows ranking section for player users', () => {
    mockedUseCurrentUser.mockReturnValue({
      isUser: true,
    } as ReturnType<typeof useCurrentUser>);

    render(<ProfileComponent />);

    expect(screen.getByText('Ranking section')).toBeInTheDocument();
  });

  it('hides ranking section for admin users', () => {
    mockedUseCurrentUser.mockReturnValue({
      isUser: false,
    } as ReturnType<typeof useCurrentUser>);

    render(<ProfileComponent />);

    expect(screen.queryByText('Ranking section')).not.toBeInTheDocument();
    expect(screen.getByText('Account section')).toBeInTheDocument();
  });
});
