import { type ReactElement } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/core/i18n';

export interface TrendSeries {
  key: string;
  label: string;
  type: 'bar' | 'line';
  color: string;
}

interface DailyTrendChartProps {
  // Recharts accepts any object array — we keep it loose to avoid casting at call sites
  data: object[];
  series: TrendSeries[];
  height?: number;
}

export const DailyTrendChart = ({
  data,
  series,
  height = 220,
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          cursor={{ fill: 'var(--color-border)', fillOpacity: 0.3 }}
        />
        <Legend
          wrapperStyle={{
            fontSize: 11,
            paddingTop: 8,
            color: 'var(--color-text-secondary)',
          }}
        />
        {series.map((s) =>
          s.type === 'bar' ? (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
              fillOpacity={0.85}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ),
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
