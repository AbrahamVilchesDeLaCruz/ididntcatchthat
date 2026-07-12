import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RuntimeMetricsSection } from '../RuntimeMetricsSection';
import type { RuntimeMetrics } from '../../utils/parseMetrics';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';

const runtime: RuntimeMetrics = {
  heapUsedBytes: 50 * 1_024 * 1_024,
  heapTotalBytes: 100 * 1_024 * 1_024,
  heapUsedPct: 50,
  eventLoopLagP95Ms: 12,
  uptimeSeconds: 3 * 86_400,
  gcDurationTotalSeconds: 0.5,
  activeHandles: 42,
  residentMemoryBytes: 80 * 1_024 * 1_024,
  processStartTimestamp: 1_700_000_000,
  cpuSecondsTotal: 42.5,
};

describe('RuntimeMetricsSection', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders the six metric labels from i18n', () => {
    render(<RuntimeMetricsSection runtime={runtime} isLoading={false} />);

    expect(
      screen.getByText(en.backoffice.observability.runtime.heapUsed),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.runtime.eventLoopLagP95),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.runtime.uptime),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.runtime.gcTotal),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.runtime.activeHandles),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.runtime.rssMemory),
    ).toBeInTheDocument();
  });

  it('exposes an Info tooltip trigger for each of the six metrics with i18n content', () => {
    render(<RuntimeMetricsSection runtime={runtime} isLoading={false} />);

    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.runtime.heapUsedTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.runtime.eventLoopLagP95Tooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.runtime.uptimeTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.runtime.gcTotalTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.runtime.activeHandlesTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.runtime.rssMemoryTooltip,
      }),
    ).toBeInTheDocument();
  });
});
