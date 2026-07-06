import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { GuestStatsPanel } from '../GuestStatsPanel';
import { useGuestStatsStore } from '@/core/store/guestStats.store';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('GuestStatsPanel', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    useGuestStatsStore.setState({
      gamesPlayed: 0,
      totalAttempts: 0,
      failedFlashcardIds: [],
    });
  });

  it('shows a play CTA when guest stats are empty', () => {
    render(<GuestStatsPanel onRegister={vi.fn()} />);

    const playLink = screen.getByRole('link', {
      name: en.stats.guest.emptyPlayCta,
    });
    expect(playLink).toHaveAttribute('href', '/game');
  });

  it('shows guest KPIs and register CTA when stats exist', async () => {
    const onRegister = vi.fn();
    const user = userEvent.setup();

    useGuestStatsStore.setState({
      gamesPlayed: 2,
      totalAttempts: 10,
      failedFlashcardIds: ['fc-1'],
    });

    render(<GuestStatsPanel onRegister={onRegister} />);

    expect(screen.getByText(en.stats.guest.title)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: en.stats.guest.registerCta }),
    );

    expect(onRegister).toHaveBeenCalledOnce();
  });
});
