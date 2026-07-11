import { type ReactElement } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/core/i18n';

export interface TrendSeries {
  key: string;
  label: string;
  /** @deprecated No longer used — all series render as dots */
  type?: 'bar' | 'line';
  color: string;
}

interface DailyTrendChartProps {
  data: object[];
  series: TrendSeries[];
  height?: number;
  ariaLabel?: string;
}

const tooltipStyle = {
  backgroundColor: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: 12,
  color: 'var(--color-text-primary)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

const RAW_KEYS = new Set(['date', 'value']);

const TrendTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: unknown;
    color?: string;
  }>;
  label?: string;
}): ReactElement | null => {
  if (!active || !payload || payload.length === 0) return null;

  const entries = payload.filter((e) => e.name && !RAW_KEYS.has(e.name));
  if (entries.length === 0) return null;

  return (
    <div style={tooltipStyle}>
      <p
        style={{
          color: 'var(--color-text-muted)',
          margin: 0,
          fontSize: 11,
        }}
      >
        {label}
      </p>
      {entries.map((entry, i) => {
        const raw = entry.value;
        const formatted = typeof raw === 'number' ? raw.toLocaleString() : '0';
        return (
          <p
            key={i}
            style={{
              color: entry.color ?? 'var(--color-text-primary)',
              margin: '2px 0 0',
              fontWeight: 600,
            }}
          >
            {formatted} {entry.name?.toLowerCase()}
          </p>
        );
      })}
    </div>
  );
};

export const DailyTrendChart = ({
  data,
  series,
  height = 220,
  ariaLabel,
}: DailyTrendChartProps): ReactElement => {
  const { t } = useI18n();
  const hasData = (data as { [k: string]: unknown }[]).some((row) =>
    series.some((s) => Number(row[s.key] ?? 0) > 0),
  );
  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--color-text-muted)]"
        style={{ height }}
      >
        {t.backoffice.charts.noActivityInPeriod}
      </div>
    );
  }

  const pointsBySeries = series.map((s) => ({
    ...s,
    points: (data as Record<string, unknown>[]).map((d) => ({
      date: d.date as string,
      value: Number(d[s.key] ?? 0),
    })),
  }));

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="date"
            type="category"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            dataKey="value"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <ZAxis dataKey="value" range={[30, 250]} />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ fill: 'var(--color-border)', fillOpacity: 0.3 }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 11,
              paddingTop: 8,
              color: 'var(--color-text-secondary)',
            }}
          />
          {pointsBySeries.map((s) => (
            <Scatter
              key={s.key}
              data={s.points}
              name={s.label}
              fill={s.color}
              fillOpacity={0.7}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
