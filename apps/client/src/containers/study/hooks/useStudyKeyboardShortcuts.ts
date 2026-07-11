import { useEffect, useRef } from 'react';

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
  // Mismo patrón que useGameKeyboardShortcuts: refs para evitar
  // re-suscripción del listener en cada render (causa teclas perdidas
  // en producción durante el gap unmount→mount). Set en useEffect para
  // cumplir con eslint-plugin-react-hooks v5 (no refs en render).
  const callbacksRef = useRef({ onFlip, onNext, onPause });
  useEffect(() => {
    callbacksRef.current = { onFlip, onNext, onPause };
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const { onFlip, onNext, onPause } = callbacksRef.current;

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
  }, [enabled]);
};
