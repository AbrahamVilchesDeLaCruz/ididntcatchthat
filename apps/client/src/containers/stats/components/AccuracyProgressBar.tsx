import { type ReactElement } from 'react';

interface AccuracyProgressBarProps {
  value: number;
  className?: string;
}

function fillTone(value: number): string {
  if (value >= 80) return 'bg-[var(--color-accent-green)]';
  if (value >= 60) return 'bg-[var(--color-brand)]';
  return 'bg-[var(--color-accent-red)]';
}

export const AccuracyProgressBar = ({
  value,
  className = '',
}: AccuracyProgressBarProps): ReactElement => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={[
        'h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-surface)]',
        className,
      ].join(' ')}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={[
          'h-full rounded-full transition-[width] duration-300',
          fillTone(clamped),
        ].join(' ')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
