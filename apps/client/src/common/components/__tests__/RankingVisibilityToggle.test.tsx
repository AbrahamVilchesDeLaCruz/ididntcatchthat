import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RankingVisibilityToggle } from '../RankingVisibilityToggle';

describe('RankingVisibilityToggle', () => {
  it('calls onCheckedChange when a pill option is selected', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <RankingVisibilityToggle checked onCheckedChange={onCheckedChange} />,
    );

    await user.click(
      screen.getByRole('button', { name: /hidden from leaderboards/i }),
    );

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('calls onCheckedChange when visibility is enabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <RankingVisibilityToggle
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /show me in rankings/i }),
    );

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
