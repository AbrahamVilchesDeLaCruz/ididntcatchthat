import { describe, it, expect, vi } from 'vitest';
import { type ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PausedGamesPanel } from '../PausedGamesPanel';
import type { PausedGameVM } from '../../game.types';

const pausedGame: PausedGameVM = {
  gameId: 'game-1',
  mode: 'game',
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

  it('shows random module label when module is null', () => {
    renderPanel({
      games: [{ ...pausedGame, module: null }],
    });

    expect(screen.getByText('Random')).toBeInTheDocument();
  });

  it('calls onAbandon after confirmation', () => {
    const onAbandon = vi.fn();
    renderPanel({ onAbandon });

    fireEvent.click(screen.getByRole('button', { name: 'Abandon' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abandon this game?' }));

    expect(onAbandon).toHaveBeenCalledWith('game-1');
  });

  it('cancels abandon confirmation', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abandon' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
  });

  it('renders subcategory label from catalog', () => {
    renderPanel({
      games: [{ ...pausedGame, subcategory: 't_soft_between_vowels' }],
      catalog: {
        categories: [
          {
            value: 'native_sounds',
            label: { en: 'Native Sounds', es: 'Sonidos nativos' },
            subcategories: [
              {
                value: 't_soft_between_vowels',
                label: { en: 'Soft T', es: 'T suave' },
                description: { en: '', es: '' },
                anchorExamples: [],
              },
            ],
          },
        ],
      },
    });

    expect(screen.getByText(/Soft T/)).toBeInTheDocument();
  });

  it('returns null when there are no paused games', () => {
    const { container } = renderPanel({ games: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
