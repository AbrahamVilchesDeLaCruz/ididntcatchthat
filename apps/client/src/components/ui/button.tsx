import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-[var(--color-brand)] text-white hover:opacity-90',
  ghost: 'hover:bg-white/5 text-[var(--color-text-secondary)]',
  outline:
    'border border-[var(--color-border-strong)] hover:border-[var(--color-brand)] text-[var(--color-text-secondary)]',
  destructive: 'bg-[var(--color-accent-red)] text-white hover:opacity-90',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button };
