import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { type Locale } from '@/core/i18n/i18n.types';

interface LocaleToggleProps {
  /** 'pill' shows EN/ES two-way selector (sidebar).
   *  'icon' shows compact EN/ES toggle (landing). */
  variant?: 'pill' | 'icon';
}

export const LocaleToggle = ({
  variant = 'icon',
}: LocaleToggleProps): ReactElement => {
  const { t, locale, setLocale } = useI18n();
  const labels = t.common.locale;

  if (variant === 'pill') {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-1 py-1">
        <button
          type="button"
          aria-label={labels.english}
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
          className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
            locale === 'en'
              ? 'bg-[var(--color-brand)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          {labels.english}
        </button>
        <button
          type="button"
          aria-label={labels.spanish}
          aria-pressed={locale === 'es'}
          onClick={() => setLocale('es')}
          className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
            locale === 'es'
              ? 'bg-[var(--color-brand)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          {labels.spanish}
        </button>
      </div>
    );
  }

  const nextLocale: Locale = locale === 'en' ? 'es' : 'en';

  return (
    <button
      type="button"
      aria-label={labels.switchLanguage}
      onClick={() => setLocale(nextLocale)}
      className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
    >
      <span
        className={
          locale === 'en' ? 'text-[var(--color-text-primary)]' : 'opacity-40'
        }
      >
        {labels.english}
      </span>
      <span className="text-[var(--color-text-muted)]">/</span>
      <span
        className={
          locale === 'es' ? 'text-[var(--color-text-primary)]' : 'opacity-40'
        }
      >
        {labels.spanish}
      </span>
    </button>
  );
};
