import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileTabs } from '../ProfileTabs';

describe('ProfileTabs', () => {
  it('switches visible panel when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <ProfileTabs
        tabs={[
          { id: 'achievements', label: 'Achievements' },
          { id: 'ranking', label: 'Ranking' },
        ]}
        activeTab="achievements"
        onTabChange={onTabChange}
        ariaLabel="Profile sections"
      >
        <div>Panel content</div>
      </ProfileTabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Ranking' }));

    expect(onTabChange).toHaveBeenCalledWith('ranking');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel content');
  });

  it('renders children directly when only one tab exists', () => {
    render(
      <ProfileTabs
        tabs={[{ id: 'preferences', label: 'Settings' }]}
        activeTab="preferences"
        onTabChange={vi.fn()}
        ariaLabel="Profile sections"
      >
        <div>Solo panel</div>
      </ProfileTabs>,
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByText('Solo panel')).toBeInTheDocument();
  });
});
