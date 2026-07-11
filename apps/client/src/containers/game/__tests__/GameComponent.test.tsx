import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { GameComponent } from '../GameComponent';
import type { FlashcardGameVM } from '../game.types';

const playMock = vi.fn().mockResolvedValue(undefined);

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
    useI18n.setState({ locale: 'en', t: en });
    vi.clearAllMocks();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(playMock);
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it('shows a loading spinner while loading', () => {
    render(<GameComponent {...defaultProps} isLoading flashcard={null} />);

    expect(
      screen.getByRole('status', { name: en.common.loading }),
    ).toBeInTheDocument();
  });

  it('flips the card when the front is clicked', () => {
    const onFlip = vi.fn();

    render(<GameComponent {...defaultProps} onFlip={onFlip} />);

    fireEvent.click(document.querySelector('.game-card-wrapper')!);

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('plays expression and example audio from the back', () => {
    render(<GameComponent {...defaultProps} isFlipped />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'American English' })[0],
    );
    fireEvent.click(screen.getByRole('button', { name: 'Play example' }));

    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('does NOT render the redundant "Listen native" button on the back — los 3 dialectos + el altavoz de ejemplos ya cubren el audio', () => {
    render(<GameComponent {...defaultProps} isFlipped />);

    expect(
      screen.queryByRole('button', { name: /Listen native/i }),
    ).not.toBeInTheDocument();
  });

  it('atajo Y con la carta volteada dispara la misma animación visual que el icono de correcto', () => {
    render(<GameComponent {...defaultProps} isFlipped />);

    expect(document.querySelector('.game-card-stage')).not.toHaveClass(
      'game-card-feedback--correct',
    );

    fireEvent.keyDown(window, { key: 'y' });

    expect(document.querySelector('.game-card-stage')).toHaveClass(
      'game-card-feedback--correct',
    );
  });

  it('atajo N con la carta volteada dispara la misma animación visual que el icono de incorrecto', () => {
    render(<GameComponent {...defaultProps} isFlipped />);

    fireEvent.keyDown(window, { key: 'n' });

    expect(document.querySelector('.game-card-stage')).toHaveClass(
      'game-card-feedback--incorrect',
    );
  });

  it('la cara B usa la clase app-scroll para que el scrollbar quede estilizado (no el default del browser)', () => {
    render(<GameComponent {...defaultProps} isFlipped />);

    const scrollables = document.querySelectorAll(
      '.flashcard-card-face .app-scroll',
    );
    expect(scrollables.length).toBeGreaterThan(0);
  });

  it('renders multiple dialect buttons when urls exist', () => {
    render(
      <GameComponent
        {...defaultProps}
        flashcard={{
          ...flashcard,
          audioUrls: {
            expression: {
              us: 'https://audio.test/us.mp3',
              uk: 'https://audio.test/uk.mp3',
              au: 'https://audio.test/au.mp3',
            },
            examples: { us: 'https://audio.test/ex.mp3' },
          },
        }}
        isFlipped
      />,
    );

    expect(
      screen.getAllByRole('button', { name: 'British English' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Australian English' }).length,
    ).toBeGreaterThan(0);
  });

  it('calls onAnswer with false for an incorrect mark', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();

    render(<GameComponent {...defaultProps} isFlipped onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole('button', { name: /I didn't know/i }));
    vi.advanceTimersByTime(320);

    expect(onAnswer).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  it('advances to the next card front without an intermediate flip', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();

    const { rerender } = render(
      <GameComponent {...defaultProps} isFlipped onAnswer={onAnswer} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /I knew it/i }));
    vi.advanceTimersByTime(320);

    rerender(
      <GameComponent
        {...defaultProps}
        isFlipped={false}
        onAnswer={onAnswer}
        flashcard={{ ...flashcard, id: 'fc-2', expression: 'world' }}
      />,
    );

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getAllByText('World').length).toBeGreaterThan(0);

    vi.useRealTimers();
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

    expect(
      within(screen.getByTestId('play-toolbar-desktop')).getByRole('button', {
        name: 'Pause',
      }),
    ).toBeInTheDocument();
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

    const desktop = screen.getByTestId('play-toolbar-desktop');

    expect(within(desktop).getByRole('progressbar')).toBeInTheDocument();
    expect(within(desktop).getByText('1 of 5')).toBeInTheDocument();
    expect(within(desktop).getByText('Space')).toBeInTheDocument();
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
