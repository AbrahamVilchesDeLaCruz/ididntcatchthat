import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  examples: [
    {
      id: 'ex-1',
      textEn: 'Hello there',
      textEs: 'Hola a todos',
      position: 1,
    },
  ],
};

const defaultProps = {
  flashcard,
  isLoading: false,
  isFlipped: false,
  currentIndex: 0,
  totalCount: 5,
  correctCount: 0,
  incorrectCount: 0,
  onFlip: vi.fn(),
  onAnswer: vi.fn(),
};

describe('GameComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it('shows click-to-reveal hint and IPA on the front', () => {
    render(<GameComponent {...defaultProps} />);

    expect(
      screen.getByText('Click or press Space to reveal'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('/həˈloʊ/').length).toBeGreaterThanOrEqual(1);
  });

  it('shows pause control in the toolbar when allowed', () => {
    render(<GameComponent {...defaultProps} canPause onPause={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('shows IPA and a single examples audio control on the back', () => {
    render(<GameComponent {...defaultProps} isFlipped />);

    expect(screen.getAllByText('/həˈloʊ/').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('"Hello there"')).toBeInTheDocument();
    expect(screen.getByText('Hola a todos')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Play example' }),
    ).toHaveLength(1);
  });

  it('keeps card faces absolutely positioned for 3d flip', () => {
    const { container } = render(<GameComponent {...defaultProps} />);

    const faces = container.querySelectorAll('.game-card-inner > div');
    expect(faces).toHaveLength(2);
    faces.forEach((face) => {
      expect(face.className).toContain('absolute');
      expect(face.className).toContain('inset-0');
    });
  });

  it('renders split progress bar with correct and incorrect segments', () => {
    render(
      <GameComponent
        {...defaultProps}
        correctCount={2}
        incorrectCount={1}
        totalCount={5}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('keeps the back face visible during answer feedback', () => {
    const onFlip = vi.fn();

    render(<GameComponent {...defaultProps} isFlipped onFlip={onFlip} />);

    fireEvent.click(screen.getByRole('button', { name: /I knew it/i }));

    expect(onFlip).not.toHaveBeenCalled();
  });

  it('calls onAnswer after marking an answer on the back', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();

    render(<GameComponent {...defaultProps} isFlipped onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole('button', { name: /I knew it/i }));
    vi.advanceTimersByTime(320);

    expect(onAnswer).toHaveBeenCalledWith(true);
    vi.useRealTimers();
  });
});
