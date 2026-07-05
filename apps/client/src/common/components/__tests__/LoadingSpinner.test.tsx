import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('exposes status semantics with default loading label', () => {
    render(<LoadingSpinner />);

    expect(
      screen.getByRole('status', { name: en.common.loading }),
    ).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(<LoadingSpinner label="Loading ranking..." />);

    expect(
      screen.getByRole('status', { name: 'Loading ranking...' }),
    ).toBeInTheDocument();
  });

  it('supports size variants', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" className="mx-auto" />);
    expect(screen.getByRole('status')).toHaveClass('mx-auto');
  });
});
