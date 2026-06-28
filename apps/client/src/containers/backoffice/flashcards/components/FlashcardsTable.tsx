import { type ReactElement } from 'react';
import type { FlashcardVM } from '../flashcards.types';

const AUDIO_STATUS_LABELS: Record<FlashcardVM['audioStatus'], string> = {
  pending: 'Pendiente',
  generating: 'Generando',
  ready: 'Listo',
  failed: 'Error',
};

const AUDIO_STATUS_COLORS: Record<FlashcardVM['audioStatus'], string> = {
  pending: 'text-yellow-600 bg-yellow-400/10',
  generating: 'text-blue-600 bg-blue-400/10',
  ready: 'text-green-600 bg-green-400/10',
  failed: 'text-red-600 bg-red-400/10',
};

interface FlashcardsTableProps {
  flashcards: FlashcardVM[];
  isLoading: boolean;
  onView: (flashcard: FlashcardVM) => void;
  onEdit: (flashcard: FlashcardVM) => void;
  onDelete: (id: string) => void;
}

export const FlashcardsTable = ({
  flashcards,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: FlashcardsTableProps): ReactElement => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 bg-[var(--color-bg-elevated)] animate-pulse border-b border-[var(--color-border)] last:border-b-0"
          />
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] py-16 text-center text-[var(--color-text-secondary)]">
        No hay flashcards. ¡Creá la primera!
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium">
              Expresión
            </th>
            <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium hidden md:table-cell">
              Categoría
            </th>
            <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium hidden lg:table-cell">
              Subcategoría
            </th>
            <th className="text-left px-4 py-3 text-[var(--color-text-secondary)] font-medium hidden lg:table-cell">
              Audio
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {flashcards.map((fc) => (
            <tr
              key={fc.id}
              className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <td className="px-4 py-3">
                <p className="text-[var(--color-text-primary)] font-medium">
                  {fc.expression}
                </p>
                <p className="text-[var(--color-text-secondary)] text-xs mt-0.5 line-clamp-1">
                  {fc.meaning}
                </p>
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden md:table-cell">
                {fc.category}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden lg:table-cell">
                {fc.subcategory}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AUDIO_STATUS_COLORS[fc.audioStatus]}`}
                >
                  {AUDIO_STATUS_LABELS[fc.audioStatus]}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => onView(fc)}
                    className="text-xs text-[var(--color-brand)] hover:opacity-80 transition px-2 py-1 rounded hover:bg-[var(--color-brand-dim)]"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(fc)}
                    className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition px-2 py-1 rounded hover:bg-[var(--color-bg-elevated)]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(fc.id)}
                    className="text-xs text-[var(--color-accent-red)] hover:opacity-80 transition px-2 py-1 rounded hover:bg-[var(--color-accent-red)]/10"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
