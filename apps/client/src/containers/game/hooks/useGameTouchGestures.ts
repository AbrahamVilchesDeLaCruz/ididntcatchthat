import { type RefObject, useEffect } from 'react';

const SWIPE_THRESHOLD_PX = 48;

interface UseGameTouchGesturesOptions {
  enabled: boolean;
  isFlipped: boolean;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export const useGameTouchGestures = (
  targetRef: RefObject<HTMLElement | null>,
  { enabled, isFlipped, onCorrect, onIncorrect }: UseGameTouchGesturesOptions,
): void => {
  useEffect(() => {
    const element = targetRef.current;
    if (!element || !enabled) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (event: TouchEvent): void => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchEnd = (event: TouchEvent): void => {
      if (!isFlipped) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (
        Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
        Math.abs(deltaX) < Math.abs(deltaY)
      ) {
        return;
      }

      event.preventDefault();
      if (deltaX < 0) {
        onIncorrect();
      } else {
        onCorrect();
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isFlipped, onCorrect, onIncorrect, targetRef]);
};
