import { type ReactElement, type ReactNode } from 'react';

export type ProfileTabId = 'achievements' | 'ranking' | 'preferences';

interface ProfileTab {
  id: ProfileTabId;
  label: string;
}

interface ProfileTabsProps {
  tabs: ProfileTab[];
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  ariaLabel: string;
  children: ReactNode;
}

export const ProfileTabs = ({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  children,
}: ProfileTabsProps): ReactElement => {
  if (tabs.length <= 1) {
    return <div>{children}</div>;
  }

  return (
    <div className="space-y-6">
      <div
        className="profile-tabs-nav flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px"
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`profile-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`profile-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                onTabChange(tab.id);
              }}
              className={[
                'profile-tab-btn shrink-0 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-[var(--color-brand)] bg-[var(--color-bg-card)] text-[var(--color-brand)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`profile-panel-${activeTab}`}
        aria-labelledby={`profile-tab-${activeTab}`}
      >
        {children}
      </div>
    </div>
  );
};
