import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProfileComponent } from '../ProfileComponent';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

vi.mock('@/core/auth/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('../components/ProfileHero', () => ({
  ProfileHero: () => <div>Profile hero</div>,
}));

vi.mock('../components/ProfileRankingSection', () => ({
  ProfileRankingSection: () => <div>Ranking section</div>,
}));

vi.mock('../components/ProfilePreferencesSection', () => ({
  ProfilePreferencesSection: () => <div>Preferences section</div>,
}));

vi.mock('../components/ProfileAchievementsSection', () => ({
  ProfileAchievementsSection: () => <div>Achievements section</div>,
}));

const mockedUseCurrentUser = vi.mocked(useCurrentUser);

const defaultProps = {
  achievements: [],
  achievementsLoading: false,
  showAchievements: true,
};

function renderProfile(
  props: Partial<typeof defaultProps> = {},
  initialEntry = '/profile',
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ProfileComponent {...defaultProps} {...props} />
    </MemoryRouter>,
  );
}

describe('ProfileComponent', () => {
  it('shows achievements tab by default for player users', () => {
    mockedUseCurrentUser.mockReturnValue({
      isUser: true,
      canEditRankingProfile: true,
    } as ReturnType<typeof useCurrentUser>);

    renderProfile();

    expect(screen.getByText('Profile hero')).toBeInTheDocument();
    expect(screen.getByText('Achievements section')).toBeInTheDocument();
    expect(screen.queryByText('Ranking section')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Achievements' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('hides achievements for guests and shows preferences only', () => {
    mockedUseCurrentUser.mockReturnValue({
      isUser: false,
      canEditRankingProfile: false,
    } as ReturnType<typeof useCurrentUser>);

    renderProfile({ showAchievements: false });

    expect(screen.queryByText('Ranking section')).not.toBeInTheDocument();
    expect(screen.queryByText('Achievements section')).not.toBeInTheDocument();
    expect(screen.getByText('Profile hero')).toBeInTheDocument();
    expect(screen.getByText('Preferences section')).toBeInTheDocument();
  });

  it('lists ranking tab for admin accounts', () => {
    mockedUseCurrentUser.mockReturnValue({
      isUser: false,
      canEditRankingProfile: true,
    } as ReturnType<typeof useCurrentUser>);

    renderProfile();

    expect(
      screen.getByRole('tab', { name: 'Public identity' }),
    ).toBeInTheDocument();
  });
});
