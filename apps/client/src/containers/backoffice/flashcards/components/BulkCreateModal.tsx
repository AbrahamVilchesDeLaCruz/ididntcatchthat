import { useState, type ReactElement } from 'react';
import type { CreateFlashcardApiPayload } from '../api/flashcards.api-model';

interface BulkCreateModalProps {
  isLoading: boolean;
  onSubmit: (flashcards: CreateFlashcardApiPayload[]) => void;
  onClose: () => void;
}

const PLACEHOLDER = JSON.stringify(
  [
    {
      id: 'uuid-here',
      expression: 'gonna',
      meaning: 'going to — forma reducida coloquial',
      category: 'connected_speech',
      subcategory: 'informal_going_to',
      ipaNotation: 'ˈɡɒnə',
      nativeSpeech: 'gonna',
      examples: [
        {
          id: 'uuid-here',
          textEn: "I'm gonna call you later.",
          textEs: 'Te voy a llamar más tarde.',
          position: 0,
        },
      ],
    },
  ],
  null,
  2,
);

export const BulkCreateModal = ({
  isLoading,
  onSubmit,
  onClose,
}: BulkCreateModalProps): ReactElement => {
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSubmit = (): void => {
    setParseError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText) as unknown;
    } catch {
      setParseError('JSON inválido. Revisá la sintaxis.');
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      setParseError('El JSON debe ser un array no vacío de flashcards.');
      return;
    }

    onSubmit(parsed as CreateFlashcardApiPayload[]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-bg-surface)] rounded-xl w-full max-w-2xl border border-[var(--color-border)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-[var(--color-text-primary)] font-semibold text-lg">
              Crear flashcards en bloque
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
              Pegá un array JSON con las flashcards a crear
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {parseError && (
            <div className="p-3 rounded-lg bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/20 text-[var(--color-accent-red)] text-sm">
              {parseError}
            </div>
          )}

          <div>
            <label
              htmlFor="bulk-json"
              className="block text-sm text-[var(--color-text-secondary)] mb-2"
            >
              JSON array de flashcards
            </label>
            <textarea
              id="bulk-json"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={18}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dim)] resize-none placeholder-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !jsonText.trim()}
            className="px-4 py-2 text-sm bg-[var(--color-brand)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Creando…' : 'Crear flashcards'}
          </button>
        </div>
      </div>
    </div>
  );
};
