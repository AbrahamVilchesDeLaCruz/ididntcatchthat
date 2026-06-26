import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameComponent } from '../GameComponent';
import type { FlashcardGameVM } from '../game.types';

const flashcard: FlashcardGameVM = {
  id: 'fc-1',
  position: 1,
  expression: 'hello',
  meaning: 'hola',
  ipaNotation: '/həˈloʊ/',
  nativeSpeech: 'hello',
  audioUrls: {
    expression: { us: 'https://audio.test/us.mp3', uk: '', au: '' },
    examples: { us: 'https://audio.test/ex.mp3' },
  },
  examples: [],
};

describe('GameComponent', () => {
  it('uses i18n for pause label', () => {
    render(
      <GameComponent
        flashcard={flashcard}
        isLoading={false}
        isFlipped={false}
        currentIndex={0}
        totalCount={5}
        canPause
        onFlip={vi.fn()}
        onAnswer={vi.fn()}
        onPause={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });

  it('renders disabled microphone with coming soon label', () => {
    render(
      <GameComponent
        flashcard={flashcard}
        isLoading={false}
        isFlipped={false}
        currentIndex={0}
        totalCount={5}
        onFlip={vi.fn()}
        onAnswer={vi.fn()}
      />,
    );

    const micButton = screen.getByRole('button', { name: /Coming soon/i });
    expect(micButton).toBeDisabled();
  });

  it('shows IPA and native speech controls on the back', () => {
    render(
      <GameComponent
        flashcard={flashcard}
        isLoading={false}
        isFlipped
        currentIndex={0}
        totalCount={5}
        onFlip={vi.fn()}
        onAnswer={vi.fn()}
      />,
    );

    expect(screen.getByText('/həˈloʊ/')).toBeInTheDocument();
    expect(screen.getByText('Listen native')).toBeInTheDocument();
    expect(screen.getByText('Listen to example')).toBeInTheDocument();
  });

  it('shows loading spinner when flashcard is not ready', () => {
    const { container } = render(
      <GameComponent
        flashcard={null}
        isLoading
        isFlipped={false}
        currentIndex={0}
        totalCount={5}
        onFlip={vi.fn()}
        onAnswer={vi.fn()}
      />,
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
