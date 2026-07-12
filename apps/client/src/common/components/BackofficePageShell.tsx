import { type ReactElement, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTimeAgo } from '@/common/hooks/useTimeAgo';
import { useI18n } from '@/core/i18n';

interface BackofficePageShellProps {
  title: string;
  subtitle?: string;
  isError: boolean;
  onRetry?: () => void;
  /** ms timestamp from TanStack Query's dataUpdatedAt */
  lastUpdatedAt?: number;
  /** Optional badge/chip rendered in the header row (e.g. live indicator) */
  headerExtra?: ReactNode;
  children: ReactNode;
}

export const BackofficePageShell = ({
  title,
  subtitle,
  isError,
  onRetry,
  lastUpdatedAt,
  headerExtra,
  children,
}: BackofficePageShellProps): ReactElement => {
  const { t } = useI18n();
  const timeAgo = useTimeAgo(lastUpdatedAt);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1">
          {headerExtra}
          {timeAgo && (
            <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2.5 py-1 rounded-full whitespace-nowrap">
              {timeAgo}
            </span>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              aria-label={t.backoffice.shell.refreshAriaLabel}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {isError ? (
        <div className="rounded-xl border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/5 px-6 py-16 text-center">
          <p className="text-[var(--color-accent-red)] text-sm font-medium mb-4">
            {t.backoffice.shell.loadError}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition"
            >
              {t.backoffice.shell.retry}
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
