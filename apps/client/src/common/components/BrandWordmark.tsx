import { type ReactElement } from 'react';
import { cn } from '@/common/lib/utils';

interface BrandWordmarkProps {
  className?: string;
}

export const BrandWordmark = ({
  className,
}: BrandWordmarkProps): ReactElement => (
  <span
    className={cn(
      'font-bold leading-none tracking-tight text-[var(--color-text-primary)]',
      className,
    )}
    style={{ fontFamily: 'var(--font-display)' }}
  >
    i didn&apos;t <span className="text-[var(--color-brand)]">catch</span> that
  </span>
);
