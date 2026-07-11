import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  useState,
} from 'react';
import { useI18n } from '@/core/i18n';

interface FlashcardsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const FlashcardsPagination = ({
  page,
  totalPages,
  onPageChange,
}: FlashcardsPaginationProps): ReactElement | null => {
  const { t } = useI18n();
  const paginationT = t.backoffice.flashcards.pagination;

  const [inputValue, setInputValue] = useState<string>(String(page));
  const [previousPage, setPreviousPage] = useState<number>(page);

  // Sync external `page` changes (e.g. parent resets page to 1) into the input
  // without an effect — React's "store previous" pattern.
  if (page !== previousPage) {
    setPreviousPage(page);
    setInputValue(String(page));
  }

  if (totalPages <= 1) {
    return null;
  }

  const commitInput = (): void => {
    const trimmed = inputValue.trim();
    const parsed = Number.parseInt(trimmed, 10);
    if (
      Number.isNaN(parsed) ||
      parsed < 1 ||
      parsed > totalPages ||
      String(parsed) !== trimmed
    ) {
      setInputValue(String(page));
      return;
    }
    if (parsed !== page) onPageChange(parsed);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput();
    }
  };

  return (
    <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={paginationT.previous}
          className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          {`< ${paginationT.previous}`}
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={commitInput}
            aria-label={paginationT.pageInputLabel}
            aria-invalid={
              inputValue.trim() !== '' &&
              (Number.isNaN(Number.parseInt(inputValue, 10)) ||
                Number.parseInt(inputValue, 10) < 1 ||
                Number.parseInt(inputValue, 10) > totalPages)
            }
            className="w-16 px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dim)]"
          />
          <span>
            {paginationT.pageOf
              .replace('{page}', String(page))
              .replace('{total}', String(totalPages))}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={paginationT.next}
          className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          {`${paginationT.next} >`}
        </button>
      </div>
    </div>
  );
};
