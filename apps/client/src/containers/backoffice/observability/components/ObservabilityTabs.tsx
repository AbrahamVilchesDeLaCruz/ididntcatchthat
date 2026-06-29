import { type ReactElement, useState } from 'react';

type TabId = 'http' | 'runtime' | 'business' | 'users';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'http', label: 'HTTP' },
  { id: 'runtime', label: 'Runtime' },
  { id: 'business', label: 'Negocio' },
  { id: 'users', label: 'Usuarios' },
];

interface ObservabilityTabsProps {
  httpContent: ReactElement;
  runtimeContent: ReactElement;
  businessContent: ReactElement;
  usersContent: ReactElement;
}

export const ObservabilityTabs = ({
  httpContent,
  runtimeContent,
  businessContent,
  usersContent,
}: ObservabilityTabsProps): ReactElement => {
  const [active, setActive] = useState<TabId>('http');

  const contentMap: Record<TabId, ReactElement> = {
    http: httpContent,
    runtime: runtimeContent,
    business: businessContent,
    users: usersContent,
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium rounded-t-lg -mb-px border-b-2 transition-colors',
              active === tab.id
                ? 'border-[var(--color-brand)] text-[var(--color-brand)] bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]',
            ].join(' ')}
            aria-selected={active === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">{contentMap[active]}</div>
    </div>
  );
};
