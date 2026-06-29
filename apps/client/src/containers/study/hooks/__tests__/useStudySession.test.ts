import { describe, expect, it } from 'vitest';
import { useStudySession } from '@/containers/study/hooks/useStudySession';
import { renderHook, act } from '@testing-library/react';

const flashcards = [
  {
    id: 'fc-1',
    position: 0,
    expression: 'hello',
    meaning: 'hola',
    ipaNotation: null,
    nativeSpeech: null,
    audioUrls: null,
    examples: [],
  },
  {
    id: 'fc-2',
    position: 1,
    expression: 'world',
    meaning: 'mundo',
    ipaNotation: null,
    nativeSpeech: null,
    audioUrls: null,
    examples: [],
  },
];

describe('useStudySession', () => {
  it('advances through flashcards and completes session', () => {
    let completed = false;
    const { result } = renderHook(() =>
      useStudySession({
        flashcards,
        onSessionComplete: () => {
          completed = true;
        },
      }),
    );

    expect(result.current.currentFlashcard?.id).toBe('fc-1');

    act(() => {
      result.current.recordViewAndAdvance();
    });

    expect(result.current.currentFlashcard?.id).toBe('fc-2');

    act(() => {
      result.current.recordViewAndAdvance();
    });

    expect(completed).toBe(true);
  });
});
