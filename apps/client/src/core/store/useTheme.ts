import { useEffect } from 'react';
import { useThemeStore, type ThemePreference } from './theme.store';

const mq = (): boolean =>
  window.matchMedia('(prefers-color-scheme: light)').matches;

const applyTheme = (preference: ThemePreference): void => {
  const root = document.documentElement;
  if (preference === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (preference === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', mq() ? 'light' : 'dark');
  }
};

export const useTheme = (): {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  isDark: boolean;
} => {
  const { preference, setPreference } = useThemeStore();

  useEffect(() => {
    applyTheme(preference);

    if (preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (): void => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preference]);

  const isDark = preference === 'dark' || (preference === 'system' && !mq());

  return { preference, setPreference, isDark };
};

export const useThemeInit = (): void => {
  const { preference } = useThemeStore();

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);
};
