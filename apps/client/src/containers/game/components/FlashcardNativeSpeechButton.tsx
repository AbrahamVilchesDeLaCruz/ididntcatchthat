import { type MouseEvent, type ReactElement } from 'react';

interface FlashcardNativeSpeechButtonProps {
  label: string;
  audioUrl: string;
  onPlay: (url: string, event: MouseEvent) => void;
}

export const FlashcardNativeSpeechButton = ({
  label,
  audioUrl,
  onPlay,
}: FlashcardNativeSpeechButtonProps): ReactElement => (
  <button
    type="button"
    onClick={(event) => onPlay(audioUrl, event)}
    className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
  >
    🗣 {label}
  </button>
);
