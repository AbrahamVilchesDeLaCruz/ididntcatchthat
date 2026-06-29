import { type ReactElement } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { useTheme } from '@/core/store/useTheme';

interface ThemeToggleProps {
  /** 'pill' shows Sun/Moon two-way selector (sidebar).
   *  'icon' shows a single cycling icon (landing, compact). */
  variant?: 'pill' | 'icon';
}

export const ThemeToggle = ({
  variant = 'icon',
}: ThemeToggleProps): ReactElement => {
  const { t } = useI18n();
  const themeLabels = t.common.theme;
  const { isDark, setPreference } = useTheme();

  const toggle = (): void => setPreference(isDark ? 'light' : 'dark');

  if (variant === 'pill') {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-1 py-1">
        <button
          type="button"
          aria-label={themeLabels.lightMode}
          aria-pressed={!isDark}
          onClick={() => setPreference('light')}
          className={`flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors ${
            !isDark
              ? 'bg-[var(--color-brand)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={themeLabels.darkMode}
          aria-pressed={isDark}
          onClick={() => setPreference('dark')}
          className={`flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors ${
            isDark
              ? 'bg-[var(--color-brand)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={isDark ? themeLabels.activateLight : themeLabels.activateDark}
      onClick={toggle}
      className="flex items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  );
};
