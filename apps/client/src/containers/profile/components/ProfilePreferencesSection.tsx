import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import { LocaleToggle } from '@/common/components/LocaleToggle';

export const ProfilePreferencesSection = (): ReactElement => {
  const { t } = useI18n();
  const p = t.profile.preferences;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {p.title}
      </h2>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
            {p.themeLabel}
          </p>
          <div className="max-w-xs">
            <ThemeToggle variant="pill" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
            {p.localeLabel}
          </p>
          <div className="max-w-xs">
            <LocaleToggle variant="pill" />
          </div>
        </div>
      </div>
    </section>
  );
};
