import { type ReactElement } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/core/i18n';
import { chartSeriesColor } from '@/common/charts/chartPalette';

interface ModulesRadarChartProps {
  data: { name: string; value: number }[];
  height?: number;
  ariaLabel?: string;
}

export const ModulesRadarChart = ({
  data,
  height = 200,
  ariaLabel,
}: ModulesRadarChartProps): ReactElement => {
  const { t } = useI18n();

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--color-text-muted)]"
        style={{ height }}
      >
        {t.backoffice.charts.noDataInPeriod}
      </div>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--color-border)" strokeOpacity={0.5} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <PolarRadiusAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: 12,
              color: 'var(--color-text-primary)',
            }}
          />
          <Radar
            dataKey="value"
            name={ariaLabel ?? ''}
            fill={chartSeriesColor(0)}
            fillOpacity={0.4}
            stroke={chartSeriesColor(0)}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
