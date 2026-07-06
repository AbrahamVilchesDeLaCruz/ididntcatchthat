import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

interface SkipToContentLinkProps {
  targetId: string;
}

export const SkipToContentLink = ({
  targetId,
}: SkipToContentLinkProps): ReactElement => {
  const { t } = useI18n();

  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-[var(--color-border)] focus:bg-[var(--color-bg-card)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-text-primary)]"
    >
      {t.common.skipToContent}
    </a>
  );
};
