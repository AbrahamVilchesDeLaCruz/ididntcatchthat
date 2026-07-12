import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoTooltip } from '../InfoTooltip';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';

describe('InfoTooltip', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders an Info icon trigger button', () => {
    render(<InfoTooltip content="Some explanation" />);

    const trigger = screen.getByRole('button', { name: /some explanation/i });
    expect(trigger).toBeInTheDocument();
  });

  it('does not show the tooltip content initially', () => {
    render(<InfoTooltip content="Hidden by default" />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden by default')).not.toBeInTheDocument();
  });

  it('shows the tooltip on mouse hover and hides on mouse leave', async () => {
    const user = userEvent.setup();
    render(<InfoTooltip content="Hover to reveal" />);

    const trigger = screen.getByRole('button', { name: /hover to reveal/i });

    await user.hover(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Hover to reveal');

    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the tooltip on focus and hides on blur', async () => {
    const user = userEvent.setup();
    render(<InfoTooltip content="Focus to reveal" />);

    const trigger = screen.getByRole('button', { name: /focus to reveal/i });

    await user.tab(); // focus the trigger
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Focus to reveal');

    await user.tab(); // move focus away
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
