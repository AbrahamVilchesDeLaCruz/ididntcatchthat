import { type ReactElement } from 'react';

interface RepeatWrongAnswersModalProps {
  count: number;
  onAccept: () => void;
  onDecline: () => void;
}

export const RepeatWrongAnswersModal = ({
  count,
  onAccept,
  onDecline,
}: RepeatWrongAnswersModalProps): ReactElement => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
          ¿Repasar las fallidas?
        </h2>
        <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
          Tienes {count} carta{count === 1 ? '' : 's'} incorrecta
          {count === 1 ? '' : 's'}. ¿Quieres repasarlas antes de terminar?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
          >
            Terminar
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-brand)] py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Repasar
          </button>
        </div>
      </div>
    </div>
  );
};
