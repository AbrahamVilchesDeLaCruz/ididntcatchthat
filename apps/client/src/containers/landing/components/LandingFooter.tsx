import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

export const LandingFooter = (): ReactElement => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--color-border)] px-5 py-8 text-center">
      <p className="text-sm text-[var(--color-text-muted)]">
        <span className="font-medium text-[var(--color-text-secondary)]">
          ididntcatchthat.com
        </span>{' '}
        · {t.landing.footer.tagline} · 🇺🇸 🇬🇧 🇦🇺
      </p>
    </footer>
  );
};
