import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpSummaryCards } from '../HttpSummaryCards';
import type { HttpStats, LatencyPercentiles } from '../../utils/parseMetrics';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';

const http: HttpStats = {
  totalRequests: 1234,
  successRate: 97.5,
  clientErrorRate: 1.8,
  serverErrorRate: 0.7,
  errorRate: 0.7,
  breakdown: [],
};

const latency: LatencyPercentiles = {
  p50Ms: 80,
  p95Ms: 240,
  p99Ms: 510,
  avgMs: 120,
};

describe('HttpSummaryCards', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders the four metric labels from i18n', () => {
    render(<HttpSummaryCards http={http} latency={latency} />);

    expect(
      screen.getByText(en.backoffice.observability.httpSummary.totalRequests),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.httpSummary.successRate),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.httpSummary.errorRate),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.backoffice.observability.httpSummary.latencyP95),
    ).toBeInTheDocument();
  });

  it('exposes an Info tooltip trigger for each of the four metrics with i18n content', async () => {
    const user = userEvent.setup();
    render(<HttpSummaryCards http={http} latency={latency} />);

    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.httpSummary.totalRequestsTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.httpSummary.successRateTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.httpSummary.errorRateTooltip,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: en.backoffice.observability.httpSummary.latencyP95Tooltip,
      }),
    ).toBeInTheDocument();

    // Sanity: hover one trigger, see its content in the popover
    await user.hover(
      screen.getByRole('button', {
        name: en.backoffice.observability.httpSummary.successRateTooltip,
      }),
    );
    expect(
      screen.getByText(
        en.backoffice.observability.httpSummary.successRateTooltip,
      ),
    ).toBeInTheDocument();
  });
});
