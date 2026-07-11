import { type ReactElement, useState } from 'react';
import { VisitasTab } from './VisitasTab';
import { ContenidoTab } from './ContenidoTab';
import { type SummaryPeriod } from './PeriodSelector';
import { useI18n } from '@/core/i18n';

type TabId = 'http' | 'runtime' | 'visitas' | 'contenido';

interface Tab {
  id: TabId;
  label: string;
}

interface ObservabilityTabsProps {
  httpContent: ReactElement;
  runtimeContent: ReactElement;
}

export const ObservabilityTabs = ({
  httpContent,
  runtimeContent,
}: ObservabilityTabsProps): ReactElement => {
  const { t } = useI18n();
  const [active, setActive] = useState<TabId>('http');
  const [period, setPeriod] = useState<SummaryPeriod>('7d');
  const tabs: Tab[] = [
    { id: 'http', label: t.backoffice.observability.tabs.http },
    { id: 'runtime', label: t.backoffice.observability.tabs.runtime },
    { id: 'visitas', label: t.backoffice.observability.tabs.visits },
    { id: 'contenido', label: t.backoffice.observability.tabs.content },
  ];

  const contentMap: Record<TabId, ReactElement> = {
    http: httpContent,
    runtime: runtimeContent,
    visitas: <VisitasTab period={period} onPeriodChange={setPeriod} />,
    contenido: <ContenidoTab period={period} onPeriodChange={setPeriod} />,
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
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
