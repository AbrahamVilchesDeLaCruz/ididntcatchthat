import { type ReactElement } from 'react';
import { useObservabilityState } from './hooks';
import { BackofficeObservabilityComponent } from './BackofficeObservabilityComponent';

export const BackofficeObservabilityContainer = (): ReactElement => {
  const { metricsSummary, isLoading, isError, dataUpdatedAt, refetch } =
    useObservabilityState();

  return (
    <BackofficeObservabilityComponent
      summary={metricsSummary.data ?? null}
      isLoading={isLoading}
      isError={isError}
      lastUpdatedAt={dataUpdatedAt}
      onRetry={() => void refetch()}
    />
  );
};
