import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRef, type ReactElement } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useGameTouchGestures } from '../useGameTouchGestures';

interface TouchHarnessProps {
  enabled: boolean;
  isFlipped: boolean;
  onCorrect: () => void;
  onIncorrect: () => void;
}

const TouchHarness = ({
  enabled,
  isFlipped,
  onCorrect,
  onIncorrect,
}: TouchHarnessProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  useGameTouchGestures(ref, { enabled, isFlipped, onCorrect, onIncorrect });
  return <div ref={ref} data-testid="touch-target" />;
};

const swipe = (
  target: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
): void => {
  fireEvent.touchStart(target, {
    touches: [{ clientX: from.x, clientY: from.y }],
  });
  fireEvent.touchEnd(target, {
    changedTouches: [{ clientX: to.x, clientY: to.y }],
  });
};

describe('useGameTouchGestures', () => {
  const onCorrect = vi.fn();
  const onIncorrect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onCorrect on swipe right when flipped', () => {
    const { getByTestId } = render(
      <TouchHarness
        enabled
        isFlipped
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
      />,
    );

    swipe(getByTestId('touch-target'), { x: 40, y: 100 }, { x: 120, y: 100 });

    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(onIncorrect).not.toHaveBeenCalled();
  });

  it('calls onIncorrect on swipe left when flipped', () => {
    const { getByTestId } = render(
      <TouchHarness
        enabled
        isFlipped
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
      />,
    );

    swipe(getByTestId('touch-target'), { x: 120, y: 100 }, { x: 40, y: 100 });

    expect(onIncorrect).toHaveBeenCalledTimes(1);
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('ignores swipes when the card is not flipped', () => {
    const { getByTestId } = render(
      <TouchHarness
        enabled
        isFlipped={false}
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
      />,
    );

    swipe(getByTestId('touch-target'), { x: 40, y: 100 }, { x: 120, y: 100 });

    expect(onCorrect).not.toHaveBeenCalled();
    expect(onIncorrect).not.toHaveBeenCalled();
  });

  it('ignores swipes when disabled', () => {
    const { getByTestId } = render(
      <TouchHarness
        enabled={false}
        isFlipped
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
      />,
    );

    swipe(getByTestId('touch-target'), { x: 40, y: 100 }, { x: 120, y: 100 });

    expect(onCorrect).not.toHaveBeenCalled();
    expect(onIncorrect).not.toHaveBeenCalled();
  });

  it('ignores short and vertical swipes', () => {
    const { getByTestId } = render(
      <TouchHarness
        enabled
        isFlipped
        onCorrect={onCorrect}
        onIncorrect={onIncorrect}
      />,
    );

    const target = getByTestId('touch-target');

    swipe(target, { x: 100, y: 100 }, { x: 120, y: 100 });
    swipe(target, { x: 100, y: 100 }, { x: 100, y: 180 });

    expect(onCorrect).not.toHaveBeenCalled();
    expect(onIncorrect).not.toHaveBeenCalled();
  });
});
