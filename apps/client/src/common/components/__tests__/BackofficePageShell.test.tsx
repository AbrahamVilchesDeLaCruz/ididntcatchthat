import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { BackofficePageShell } from '../BackofficePageShell';

describe('BackofficePageShell', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders children when there is no error', () => {
    render(
      <BackofficePageShell title="Game metrics" isError={false}>
        <div>Metrics content</div>
      </BackofficePageShell>,
    );

    expect(screen.getByText('Metrics content')).toBeInTheDocument();
    expect(
      screen.queryByText(en.backoffice.shell.loadError),
    ).not.toBeInTheDocument();
  });

  it('renders backoffice shell copy from i18n when loading fails', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <BackofficePageShell
        title="Game metrics"
        subtitle="Quality, volume, and trends"
        isError
        onRetry={onRetry}
      >
        <div>Metrics content</div>
      </BackofficePageShell>,
    );

    expect(screen.getByText(en.backoffice.shell.loadError)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.backoffice.shell.retry }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.shell.refreshAriaLabel,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: en.backoffice.shell.retry }),
    );

    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.queryByText('Metrics content')).not.toBeInTheDocument();
  });
});
