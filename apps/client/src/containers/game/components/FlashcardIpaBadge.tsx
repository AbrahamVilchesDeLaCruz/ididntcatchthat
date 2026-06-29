import { type ReactElement } from 'react';

interface FlashcardIpaBadgeProps {
  notation: string;
}

export const FlashcardIpaBadge = ({
  notation,
}: FlashcardIpaBadgeProps): ReactElement => (
  <span className="inline-block rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1 font-mono text-sm text-[var(--color-brand-light)]">
    {notation}
  </span>
);
