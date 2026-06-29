import { useLayoutEffect, useRef, useState } from 'react';

export function useCardFlipTransition(
  flashcardId: string | null | undefined,
): boolean {
  const prevFlashcardIdRef = useRef<string | null>(null);
  const [skipFlipTransition, setSkipFlipTransition] = useState(false);

  useLayoutEffect(() => {
    const nextId = flashcardId ?? null;
    if (
      prevFlashcardIdRef.current !== null &&
      prevFlashcardIdRef.current !== nextId
    ) {
      setSkipFlipTransition(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipFlipTransition(false));
      });
    }
    prevFlashcardIdRef.current = nextId;
  }, [flashcardId]);

  return skipFlipTransition;
}
