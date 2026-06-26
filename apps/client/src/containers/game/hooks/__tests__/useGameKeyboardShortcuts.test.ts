import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameKeyboardShortcuts } from '../useGameKeyboardShortcuts';

describe('useGameKeyboardShortcuts', () => {
  const onFlip = vi.fn();
  const onCorrect = vi.fn();
  const onIncorrect = vi.fn();
  const onPause = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dispatchKey = (key: string, options: KeyboardEventInit = {}): void => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, ...options }),
    );
  };

  it('calls onFlip when Space is pressed', () => {
    renderHook(() =>
      useGameKeyboardShortcuts({
        enabled: true,
        isFlipped: false,
        onFlip,
        onCorrect,
        onIncorrect,
      }),
    );

    dispatchKey(' ');

    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('calls onCorrect when ArrowRight is pressed while flipped', () => {
    renderHook(() =>
      useGameKeyboardShortcuts({
        enabled: true,
        isFlipped: true,
        onFlip,
        onCorrect,
        onIncorrect,
      }),
    );

    dispatchKey('ArrowRight');

    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('calls onIncorrect when ArrowLeft is pressed while flipped', () => {
    renderHook(() =>
      useGameKeyboardShortcuts({
        enabled: true,
        isFlipped: true,
        onFlip,
        onCorrect,
        onIncorrect,
      }),
    );

    dispatchKey('ArrowLeft');

    expect(onIncorrect).toHaveBeenCalledTimes(1);
  });

  it('does not answer when the card is not flipped', () => {
    renderHook(() =>
      useGameKeyboardShortcuts({
        enabled: true,
        isFlipped: false,
        onFlip,
        onCorrect,
        onIncorrect,
      }),
    );

    dispatchKey('ArrowRight');
    dispatchKey('ArrowLeft');

    expect(onCorrect).not.toHaveBeenCalled();
    expect(onIncorrect).not.toHaveBeenCalled();
  });

  it('calls onPause when P is pressed', () => {
    renderHook(() =>
      useGameKeyboardShortcuts({
        enabled: true,
        isFlipped: false,
        onFlip,
        onCorrect,
        onIncorrect,
        onPause,
      }),
    );

    dispatchKey('p');

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('ignores shortcuts when disabled', () => {
    renderHook(() =>
      useGameKeyboardShortcuts({
        enabled: false,
        isFlipped: true,
        onFlip,
        onCorrect,
        onIncorrect,
        onPause,
      }),
    );

    dispatchKey(' ');
    dispatchKey('ArrowRight');
    dispatchKey('p');

    expect(onFlip).not.toHaveBeenCalled();
    expect(onCorrect).not.toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
  });
});
