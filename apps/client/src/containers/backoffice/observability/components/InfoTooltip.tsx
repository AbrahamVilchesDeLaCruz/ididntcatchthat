import { type ReactElement, useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
}

export const InfoTooltip = ({ content }: InfoTooltipProps): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => {
        setOpen(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={content}
        aria-describedby={open ? 'info-tooltip-popover' : undefined}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      >
        <Info aria-hidden className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          id="info-tooltip-popover"
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-3 text-left text-xs leading-relaxed text-[var(--color-text-secondary)] shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  );
};
