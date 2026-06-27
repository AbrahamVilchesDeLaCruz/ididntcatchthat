import { useEffect, useState } from 'react';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

const getFinePointerMatch = (): boolean => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia(FINE_POINTER_QUERY).matches;
};

export const usePrefersFinePointer = (): boolean => {
  const [prefersFinePointer, setPrefersFinePointer] =
    useState(getFinePointerMatch);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(FINE_POINTER_QUERY);
    const handleChange = (): void => setPrefersFinePointer(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return prefersFinePointer;
};
