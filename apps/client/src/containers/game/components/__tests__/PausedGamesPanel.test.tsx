import { describe, it, expect, vi } from 'vitest';
import { type ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PausedGamesPanel } from '../PausedGamesPanel';
import type { PausedGameVM } from '../../game.types';

const pausedGame: PausedGameVM = {
  gameId: 'game-1',
  module: 'native_sounds',
  subcategory: null,
  cardCount: 10,
  startedAt: new Date('2026-01-01T12:00:00.000Z'),
  lastFlashcardId: 'fc-1',
};

const renderPanel = (
  props: Partial<ComponentProps<typeof PausedGamesPanel>> = {},
): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PausedGamesPanel
        games={[pausedGame]}
        catalog={undefined}
        onContinue={vi.fn()}
        onAbandon={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
};

describe('PausedGamesPanel', () => {
  it('renders paused games title and continue action', () => {
    renderPanel();

    expect(screen.getByText('Games in progress')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
  });

  it('calls onContinue with game id', () => {
    const onContinue = vi.fn();
    renderPanel({ onContinue });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onContinue).toHaveBeenCalledWith('game-1');
  });

  it('returns null when there are no paused games', () => {
    const { container } = renderPanel({ games: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
