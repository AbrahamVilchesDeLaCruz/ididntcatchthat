import { type MouseEvent, type ReactElement } from 'react';
import { Volume2 } from 'lucide-react';
import { capitalizeFirst } from '../game.text';
import type { FlashcardGameVM } from '../game.types';

interface FlashcardExampleSectionProps {
  examples: FlashcardGameVM['examples'];
  exampleAudioUrl: string | null;
  playExampleLabel: string;
  onPlayExample?: (url: string, event: MouseEvent) => void;
}

export const FlashcardExampleSection = ({
  examples,
  exampleAudioUrl,
  playExampleLabel,
  onPlayExample,
}: FlashcardExampleSectionProps): ReactElement | null => {
  if (examples.length === 0) return null;

  return (
    <div className="w-full max-w-md shrink-0">
      {exampleAudioUrl !== null && onPlayExample ? (
        <div className="mb-3 flex justify-center">
          <button
            type="button"
            onClick={(event) => onPlayExample(exampleAudioUrl, event)}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            title={playExampleLabel}
            aria-label={playExampleLabel}
          >
            <Volume2 size={16} strokeWidth={2} />
          </button>
        </div>
      ) : null}
      <ul className="flex flex-col gap-4">
        {examples.map((example) => (
          <li key={example.id} className="text-center">
            <p className="text-[15px] italic text-[var(--color-text-primary)]">
              "{capitalizeFirst(example.textEn)}"
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              {capitalizeFirst(example.textEs)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
