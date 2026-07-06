import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import * as gameApi from '../api/game.api';
import * as useGameSessionModule from '../hooks/useGameSession';
import type { GameSessionPhase } from '../hooks/useGameSession';
import { GameContainer } from '../GameContainer';

const refetchResume = vi.fn();
const completeGame = vi.fn();
const patchGame = vi.fn();
const recordAttempt = vi.fn();
let triggerOriginalQueueComplete: (() => void) | undefined;

type MutationCallbacks = {
  onError?: () => void;
  onSuccess?: (summary: {
    correctCount: number;
    totalCount: number;
    duration: number;
    accuracy: number;
  }) => void;
};

const flashcard = {
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

const defaultSession: ReturnType<typeof useGameSessionModule.useGameSession> = {
  currentFlashcard: flashcard,
  activeFlashcards: [flashcard],
  phase: 'playing',
  isFlipped: false,
  currentIndex: 0,
  totalCount: 1,
  correctCount: 0,
  incorrectCount: 0,
  wrongFlashcardIds: [],
  wrongCount: 0,
  setIsFlipped: vi.fn(),
  toggleFlip: vi.fn(),
  recordAnswer: vi.fn(),
  acceptRepeatWrong: vi.fn(),
  declineRepeatWrong: vi.fn(),
};

vi.mock('../api/game.api', () => ({
  useGameFlashcards: vi.fn(() => ({
    data: [flashcard],
    isLoading: false,
  })),
  useResumeGame: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: true,
    refetch: refetchResume,
  })),
  useRecordAttempt: vi.fn(() => ({ mutateAsync: recordAttempt })),
  useCompleteGame: vi.fn(() => ({ mutate: completeGame, isPending: false })),
  usePatchGame: vi.fn(() => ({ mutate: patchGame, isPending: false })),
}));

vi.mock('../hooks/useGameSession', () => ({
  useGameSession: vi.fn((args: { onOriginalQueueComplete?: () => void }) => {
    triggerOriginalQueueComplete = args.onOriginalQueueComplete;
    return defaultSession;
  }),
}));

vi.mock('../hooks/useGameKeyboardShortcuts', () => ({
  useGameKeyboardShortcuts: vi.fn(),
}));

vi.mock('@/core/progress/useProgressSideEffects', () => ({
  useProgressSideEffects: vi.fn(() => ({
    pollRecentUnlocks: vi.fn(),
    showOptimisticGameUnlocks: vi.fn(),
    reconcileProgress: vi.fn(),
  })),
}));

function renderGameRoute(
  initialEntry: string | { pathname: string; state?: Record<string, unknown> },
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/game/:gameId" element={<GameContainer />} />
        <Route path="/game" element={<div>Game config screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockNonResumeGame(): void {
  vi.mocked(gameApi.useResumeGame).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: refetchResume,
  } as unknown as ReturnType<typeof gameApi.useResumeGame>);
}

describe('GameContainer', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    useAuthStore.setState({ userType: 'user' });
    refetchResume.mockClear();
    completeGame.mockReset();
    patchGame.mockReset();
    recordAttempt.mockReset();
    recordAttempt.mockResolvedValue(undefined);
    triggerOriginalQueueComplete = undefined;
    Object.assign(defaultSession, {
      currentFlashcard: flashcard,
      activeFlashcards: [flashcard],
      phase: 'playing' satisfies GameSessionPhase,
      isFlipped: false,
      wrongCount: 0,
    });
    vi.mocked(useGameSessionModule.useGameSession).mockImplementation(
      (args) => {
        triggerOriginalQueueComplete = args.onOriginalQueueComplete;
        return defaultSession;
      },
    );
    vi.mocked(gameApi.useResumeGame).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchResume,
    } as unknown as ReturnType<typeof gameApi.useResumeGame>);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it('shows resume error actions instead of silently redirecting', async () => {
    const user = userEvent.setup();

    renderGameRoute('/game/game-1');

    expect(screen.getByText(en.game.errors.resumeFailed)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: en.game.errors.retry }),
    );
    expect(refetchResume).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole('button', { name: en.game.errors.startNewGame }),
    );
    expect(screen.getByText('Game config screen')).toBeInTheDocument();
  });

  it('shows complete error with retry when finishing the game fails', async () => {
    const user = userEvent.setup();
    mockNonResumeGame();
    completeGame.mockImplementation(
      (_gameId: string, options?: MutationCallbacks) => {
        options?.onError?.();
      },
    );

    renderGameRoute({
      pathname: '/game/game-1',
      state: { flashcardIds: ['fc-1'] },
    });

    await waitFor(() => {
      expect(triggerOriginalQueueComplete).toBeDefined();
    });

    act(() => {
      triggerOriginalQueueComplete?.();
    });

    expect(screen.getByText(en.game.errors.completeFailed)).toBeInTheDocument();

    completeGame.mockClear();
    await user.click(
      screen.getByRole('button', { name: en.game.errors.retry }),
    );

    expect(completeGame).toHaveBeenCalledOnce();
  });

  it('shows pause error when pausing fails', async () => {
    const user = userEvent.setup();
    mockNonResumeGame();
    patchGame.mockImplementation(
      (_payload: unknown, options?: MutationCallbacks) => {
        options?.onError?.();
      },
    );

    renderGameRoute({
      pathname: '/game/game-1',
      state: { flashcardIds: ['fc-1'] },
    });

    await user.click(screen.getAllByRole('button', { name: 'Pause' })[0]);

    expect(screen.getByText(en.game.errors.pauseFailed)).toBeInTheDocument();
  });

  it('shows record error when saving an attempt fails', async () => {
    mockNonResumeGame();
    defaultSession.isFlipped = true;
    recordAttempt.mockRejectedValue(new Error('network'));

    renderGameRoute({
      pathname: '/game/game-1',
      state: { flashcardIds: ['fc-1'] },
    });

    fireEvent.click(screen.getByRole('button', { name: /I knew it/i }));

    await waitFor(() => {
      expect(screen.getByText(en.game.errors.recordFailed)).toBeInTheDocument();
    });
  });

  it('shows repeat-wrong modal when the session enters repeat-prompt phase', () => {
    mockNonResumeGame();
    defaultSession.phase = 'repeat-prompt';
    defaultSession.wrongCount = 2;

    renderGameRoute({
      pathname: '/game/game-1',
      state: { flashcardIds: ['fc-1'] },
    });

    expect(screen.getByText('¿Repasar las fallidas?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Repasar' })).toBeInTheDocument();
  });
});
