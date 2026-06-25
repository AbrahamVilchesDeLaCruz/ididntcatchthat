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
          className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-medium text-sm">{draft.expression}</p>
            <span className="text-xs text-gray-500 shrink-0">
              {draft.subcategory}
            </span>
          </div>

          <p className="text-gray-400 text-xs">{draft.meaning}</p>

          {draft.nativeSpeech && (
            <p className="text-gray-500 text-xs italic">
              &ldquo;{draft.nativeSpeech}&rdquo;
            </p>
          )}

          {draft.ipaNotation && (
            <p className="text-gray-500 text-xs font-mono">
              {draft.ipaNotation}
            </p>
          )}

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">
              Ejemplos
            </p>
            {draft.examples.length > 0 ? (
              <ul className="space-y-2">
                {draft.examples.map((ex, exIdx) => (
                  <li
                    key={`${ex.textEn}-${String(exIdx)}`}
                    className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
                  >
                    <p className="text-white text-sm">{ex.textEn}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{ex.textEs}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-xs">Sin ejemplos generados.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
