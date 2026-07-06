import { useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { HelpCircle } from 'lucide-react';

interface PlayControlsHelpProps {
  ariaLabel: string;
  title: string;
  items: string[];
}

export const PlayControlsHelp = ({
  ariaLabel,
  title,
  items,
}: PlayControlsHelpProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
      >
        <HelpCircle size={16} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={title}
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-lg"
        >
          <p className="mb-2 text-xs font-semibold text-[var(--color-text-primary)]">
            {title}
          </p>
          <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
