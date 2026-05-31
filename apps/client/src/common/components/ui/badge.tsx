import * as React from 'react';
import { cn } from '@/common/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[var(--color-brand)] text-white',
  secondary: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]',
  destructive: 'bg-[var(--color-accent-red)] text-white',
  outline:
    'border border-[var(--color-border)] text-[var(--color-text-primary)]',
};

function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
