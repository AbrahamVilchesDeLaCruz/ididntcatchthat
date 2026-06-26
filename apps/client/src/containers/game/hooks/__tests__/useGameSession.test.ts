import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSession } from '../useGameSession';
import type { FlashcardGameVM } from '../../game.types';

const flashcards: FlashcardGameVM[] = [
  {
    id: 'fc-1',
    position: 1,
    expression: 'hello',
    meaning: 'hola',
    ipaNotation: null,
    nativeSpeech: null,
    audioUrls: null,
    examples: [],
  },
  {
    id: 'fc-2',
    position: 2,
    expression: 'world',
    meaning: 'mundo',
    ipaNotation: null,
    nativeSpeech: null,
    audioUrls: null,
    examples: [],
  },
];

describe('useGameSession', () => {
  it('prompts to repeat wrong answers after the original queue', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useGameSession({ flashcards, onOriginalQueueComplete: onComplete }),
    );

    act(() => result.current.recordAnswer(false));
    act(() => result.current.recordAnswer(false));

    expect(result.current.phase).toBe('repeat-prompt');
    expect(result.current.wrongCount).toBe(2);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('completes immediately when all answers are correct', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useGameSession({ flashcards, onOriginalQueueComplete: onComplete }),
    );

    act(() => result.current.recordAnswer(true));
    act(() => result.current.recordAnswer(true));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('replays wrong cards when repeat is accepted', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useGameSession({ flashcards, onOriginalQueueComplete: onComplete }),
    );

    act(() => result.current.recordAnswer(false));
    act(() => result.current.recordAnswer(true));
    act(() => result.current.acceptRepeatWrong());

    expect(result.current.phase).toBe('repeat');
    expect(result.current.totalCount).toBe(1);
    expect(result.current.currentFlashcard?.id).toBe('fc-1');
  });
});
