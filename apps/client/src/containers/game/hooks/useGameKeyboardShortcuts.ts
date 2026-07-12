import { useEffect, useRef } from 'react';

interface UseGameKeyboardShortcutsOptions {
  enabled: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  onPause?: () => void;
}

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
};

export const useGameKeyboardShortcuts = ({
  enabled,
  isFlipped,
  onFlip,
  onCorrect,
  onIncorrect,
  onPause,
}: UseGameKeyboardShortcutsOptions): void => {
  // Guardamos los callbacks en refs para que la listener siempre invoque
  // la versión más reciente sin tener que re-suscribirse en cada render
  // (eso provocaba una ventana donde las teclas se perdían en producción).
  // El set se hace en useEffect para no tocar la ref durante el render
  // (regla de eslint-plugin-react-hooks v5 modo compilación).
  const callbacksRef = useRef({
    onFlip,
    onCorrect,
    onIncorrect,
    onPause,
  });
  useEffect(() => {
    callbacksRef.current = { onFlip, onCorrect, onIncorrect, onPause };
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const { onFlip, onCorrect, onIncorrect, onPause } = callbacksRef.current;

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

      if (!isFlipped) return;

      if (key === 'arrowright' || key === 'y') {
        event.preventDefault();
        onCorrect();
        return;
      }

      if (key === 'arrowleft' || key === 'n') {
        event.preventDefault();
        onIncorrect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isFlipped]);
};
