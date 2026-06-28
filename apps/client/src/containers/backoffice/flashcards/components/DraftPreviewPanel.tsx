import { type ReactElement } from 'react';
import type { FlashcardDraftApiModel } from '../api/flashcards.api-model';

interface DraftPreviewPanelProps {
  drafts: FlashcardDraftApiModel[];
}

export const DraftPreviewPanel = ({
  drafts,
}: DraftPreviewPanelProps): ReactElement => {
  return (
    <div className="space-y-3">
      {drafts.map((draft, idx) => (
        <div
          key={`${draft.expression}-${String(idx)}`}
          className="p-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[var(--color-text-primary)] font-medium text-sm">
              {draft.expression}
            </p>
            <span className="text-xs text-[var(--color-text-muted)] shrink-0">
              {draft.subcategory}
            </span>
          </div>

          <p className="text-[var(--color-text-secondary)] text-xs">
            {draft.meaning}
          </p>

          {draft.nativeSpeech && (
            <p className="text-[var(--color-text-muted)] text-xs italic">
              &ldquo;{draft.nativeSpeech}&rdquo;
            </p>
          )}

          {draft.ipaNotation && (
            <p className="text-[var(--color-text-muted)] text-xs font-mono">
              {draft.ipaNotation}
            </p>
          )}

          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2 font-medium">
              Ejemplos
            </p>
            {draft.examples.length > 0 ? (
              <ul className="space-y-2">
                {draft.examples.map((ex, exIdx) => (
                  <li
                    key={`${ex.textEn}-${String(exIdx)}`}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2"
                  >
                    <p className="text-[var(--color-text-primary)] text-sm">
                      {ex.textEn}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
                      {ex.textEs}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--color-text-muted)] text-xs">
                Sin ejemplos generados.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
