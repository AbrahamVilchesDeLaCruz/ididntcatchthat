import { useEffect } from 'react';

interface UseStudyKeyboardShortcutsOptions {
  enabled: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPause?: () => void;
}

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
};

export const useStudyKeyboardShortcuts = ({
  enabled,
  onFlip,
  onNext,
  onPause,
}: UseStudyKeyboardShortcutsOptions): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === ' ' || key === 'spacebar') {
        event.preventDefault();
        onFlip();
        return;
      }

      if (onPause && key === 'p') {
        event.preventDefault();
        onPause();
        return;
      }

      if (key === 'enter' || key === 'arrowright') {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onFlip, onNext, onPause]);
};
