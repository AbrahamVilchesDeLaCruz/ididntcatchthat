import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { AchievementVM } from '@/core/achievements/achievement.types';
import { ProfileAchievementsSection } from '../ProfileAchievementsSection';

const sampleAchievements: AchievementVM[] = [
  {
    key: 'first_game',
    category: 'game',
    sortOrder: 1,
    unlockedAt: new Date('2026-06-01T12:00:00.000Z'),
  },
  {
    key: 'streak_7',
    category: 'streak',
    sortOrder: 10,
    unlockedAt: null,
  },
];

describe('ProfileAchievementsSection', () => {
  it('renders categories, progress and motivation', () => {
    render(
      <ProfileAchievementsSection
        achievements={sampleAchievements}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('1/2 unlocked')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Only 1 left — keep going to complete your trophy case!',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Game')).toBeInTheDocument();
    expect(screen.getByText('Streaks')).toBeInTheDocument();
    expect(
      screen.getByTestId('achievement-badge-first_game'),
    ).toHaveTextContent('First steps');
    expect(screen.getByTestId('achievement-badge-streak_7')).toHaveTextContent(
      'Week warrior',
    );
  });

  it('shows unlock tooltip when info button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProfileAchievementsSection
        achievements={sampleAchievements}
        isLoading={false}
      />,
    );

    const infoButtons = screen.getAllByRole('button', {
      name: /show unlock details/i,
    });
    await user.click(infoButtons[1]);

    expect(screen.getByRole('tooltip')).toHaveTextContent('How to unlock');
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Play or study on 7 consecutive days.',
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Why chase it');
  });

  it('shows loading skeleton while fetching', () => {
    const { container } = render(
      <ProfileAchievementsSection achievements={[]} isLoading />,
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
