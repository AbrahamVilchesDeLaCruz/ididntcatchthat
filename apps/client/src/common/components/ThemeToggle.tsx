import { type ReactElement } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/core/store/useTheme';
import type { ThemePreference } from '@/core/store/theme.store';

const CYCLE: ThemePreference[] = ['light', 'system', 'dark'];

const ICON: Record<ThemePreference, ReactElement> = {
  light: <Sun className="h-3.5 w-3.5" />,
  system: <Monitor className="h-3.5 w-3.5" />,
  dark: <Moon className="h-3.5 w-3.5" />,
};

const LABEL: Record<ThemePreference, string> = {
  light: 'Modo claro',
  system: 'Modo sistema',
  dark: 'Modo oscuro',
};

interface ThemeToggleProps {
  /** 'pill' shows Sun/Monitor/Moon three-way selector (sidebar use).
   *  'icon' shows a single cycling icon (landing/compact use). */
  variant?: 'pill' | 'icon';
}

export const ThemeToggle = ({
  variant = 'icon',
}: ThemeToggleProps): ReactElement => {
  const { preference, setPreference } = useTheme();

  if (variant === 'pill') {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-1 py-1">
        {CYCLE.map((value) => (
          <button
            key={value}
            type="button"
            aria-label={LABEL[value]}
            onClick={() => setPreference(value)}
            className={`flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors ${
              preference === value
                ? 'bg-[var(--color-brand)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {ICON[value]}
          </button>
        ))}
      </div>
    );
  }

  const next = CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length];

  return (
    <button
      type="button"
      aria-label={LABEL[next]}
      onClick={() => setPreference(next)}
      className="flex items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
    >
      {ICON[preference]}
    </button>
  );
};
