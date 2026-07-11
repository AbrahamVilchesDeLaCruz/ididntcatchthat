import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FlashcardsPagination } from '../FlashcardsPagination';
import { en } from '@/core/i18n/en';

const t = en.backoffice.flashcards;

describe('FlashcardsPagination', () => {
  const baseProps = {
    page: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  it('renders the input, the two buttons, and the page label', () => {
    render(<FlashcardsPagination {...baseProps} />);

    expect(
      screen.getByLabelText(t.pagination.pageInputLabel),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t.pagination.previous)).toBeInTheDocument();
    expect(screen.getByLabelText(t.pagination.next)).toBeInTheDocument();
    expect(
      screen.getByText(
        t.pagination.pageOf.replace('{page}', '2').replace('{total}', '5'),
      ),
    ).toBeInTheDocument();
  });

  it('disables the Previous button on page 1', () => {
    render(<FlashcardsPagination {...baseProps} page={1} totalPages={5} />);

    expect(screen.getByLabelText(t.pagination.previous)).toBeDisabled();
  });

  it('disables the Next button on the last page', () => {
    render(<FlashcardsPagination {...baseProps} page={5} totalPages={5} />);

    expect(screen.getByLabelText(t.pagination.next)).toBeDisabled();
  });

  it('calls onPageChange when the user enters a valid page and presses Enter', async () => {
    const onPageChange = vi.fn();

    render(<FlashcardsPagination {...baseProps} onPageChange={onPageChange} />);

    const input = screen.getByLabelText(t.pagination.pageInputLabel);

    await userEvent.clear(input);
    await userEvent.type(input, '4{Enter}');

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('silently reverts the input when the user enters an invalid page', async () => {
    const onPageChange = vi.fn();

    render(<FlashcardsPagination {...baseProps} onPageChange={onPageChange} />);

    const input = screen.getByLabelText(t.pagination.pageInputLabel);

    await userEvent.clear(input);
    await userEvent.type(input, '999{Enter}');

    expect(onPageChange).not.toHaveBeenCalled();
    expect(input.value).toBe('2');
  });

  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <FlashcardsPagination {...baseProps} page={1} totalPages={1} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
