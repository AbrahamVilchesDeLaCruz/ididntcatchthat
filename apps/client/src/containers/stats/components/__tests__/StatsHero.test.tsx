import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatsHero } from '@/containers/stats/components/StatsHero';

describe('StatsHero', () => {
  it('renders KPI values from summary', () => {
    render(
      <StatsHero
        summary={{
          currentStreak: 5,
          longestStreak: 12,
          accuracy7d: 82,
          totalAttempts: 100,
          weakCount: 8,
          masteredCount: 20,
          gamesCompleted: 15,
          lastPlayedAt: new Date(),
        }}
      />,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
