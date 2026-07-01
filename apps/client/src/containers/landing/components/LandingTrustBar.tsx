import { type ReactElement } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/core/i18n';

export const LandingTrustBar = (): ReactElement => {
  const { t } = useI18n();
  const items = t.landing.trustBar.items;

  return (
    <section
      aria-label="Product highlights"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 px-5 py-4"
    >
      <ul className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
          >
            <CheckCircle2
              size={15}
              strokeWidth={2}
              className="shrink-0 text-[var(--color-accent-green)]"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};
