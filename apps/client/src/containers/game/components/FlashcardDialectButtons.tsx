import { type MouseEvent, type ReactElement } from 'react';
import type { FlashcardGameVM } from '../game.types';

type AudioDialect = 'us' | 'uk' | 'au';

const DIALECT_FLAGS: Record<AudioDialect, string> = {
  us: '🇺🇸',
  uk: '🇬🇧',
  au: '🇦🇺',
};

interface FlashcardDialectButtonsProps {
  audioUrls: NonNullable<FlashcardGameVM['audioUrls']>;
  dialectLabel: (dialect: AudioDialect) => string;
  onPlay: (url: string, event: MouseEvent) => void;
}

export const FlashcardDialectButtons = ({
  audioUrls,
  dialectLabel,
  onPlay,
}: FlashcardDialectButtonsProps): ReactElement => (
  <div
    className="flex flex-wrap justify-center gap-2"
    onClick={(event) => event.stopPropagation()}
  >
    {(['us', 'uk', 'au'] as AudioDialect[]).map((dialect) => {
      const url = audioUrls.expression[dialect];
      if (!url) return null;

      return (
        <button
          key={dialect}
          type="button"
          onClick={(event) => onPlay(url, event)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] active:scale-95"
          title={dialectLabel(dialect)}
          aria-label={dialectLabel(dialect)}
        >
          <span>{DIALECT_FLAGS[dialect]}</span>
          <span aria-hidden>▶</span>
        </button>
      );
    })}
  </div>
);
