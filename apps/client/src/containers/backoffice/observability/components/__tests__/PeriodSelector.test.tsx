import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PeriodSelector } from '../PeriodSelector';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';

describe('PeriodSelector', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders the six period buttons from i18n', () => {
    render(<PeriodSelector value="7d" onChange={() => {}} />);

    expect(
      screen.getByRole('button', { name: en.backoffice.period['24h'] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.backoffice.period['7d'] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.backoffice.period['15d'] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.backoffice.period['30d'] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.backoffice.period['6m'] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.backoffice.period.all }),
    ).toBeInTheDocument();
  });

  it('highlights the active value with brand background', () => {
    render(<PeriodSelector value="30d" onChange={() => {}} />);

    const active = screen.getByRole('button', {
      name: en.backoffice.period['30d'],
    });
    expect(active.className).toContain('bg-[var(--color-brand)]');
  });

  it('calls onChange when a different period is clicked', async () => {
    const user = userEvent.setup();
    let captured: string | null = null;
    render(
      <PeriodSelector
        value="7d"
        onChange={(p) => {
          captured = p;
        }}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: en.backoffice.period['30d'] }),
    );
    expect(captured).toBe('30d');
  });
});
