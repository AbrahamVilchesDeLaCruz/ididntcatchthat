import { useMetricsSummary } from '../api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useObservabilityState() {
  const metricsSummary = useMetricsSummary();

  return {
    metricsSummary,
    isLoading: metricsSummary.isLoading,
    isError: metricsSummary.isError,
  };
}
