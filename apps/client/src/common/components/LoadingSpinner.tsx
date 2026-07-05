import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'size-4 border-2',
  md: 'size-8 border-2',
  lg: 'h-8 w-8 border-4',
};

export const LoadingSpinner = ({
  label,
  className = '',
  size = 'md',
}: LoadingSpinnerProps): ReactElement => {
  const { t } = useI18n();
  const ariaLabel = label ?? t.common.loading;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={['inline-flex', className].filter(Boolean).join(' ')}
    >
      <div
        aria-hidden
        className={[
          'animate-spin rounded-full border-[var(--color-brand)] border-t-transparent',
          sizeClasses[size],
        ].join(' ')}
      />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};
