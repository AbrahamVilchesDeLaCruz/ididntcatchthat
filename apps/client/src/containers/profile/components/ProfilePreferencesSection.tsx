import { type ReactElement } from 'react';
import { Languages, Palette } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import { LocaleToggle } from '@/common/components/LocaleToggle';

export const ProfilePreferencesSection = (): ReactElement => {
  const { t } = useI18n();
  const p = t.profile.preferences;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="profile-settings-row flex flex-col gap-4 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-[var(--color-brand)]/10 p-2 text-[var(--color-brand)]">
            <Palette size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {p.themeLabel}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {p.themeDescription}
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:pl-2">
          <ThemeToggle variant="pill" />
        </div>
      </div>

      <div className="profile-settings-row flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-[var(--color-accent-green)]/10 p-2 text-[var(--color-accent-green)]">
            <Languages size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {p.localeLabel}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {p.localeDescription}
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:pl-2">
          <LocaleToggle variant="pill" />
        </div>
      </div>
    </div>
  );
};
