import { type ReactElement } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { GamesByModuleVM } from '../backoffice-games.types';
import { useI18n } from '@/core/i18n';
import { chartSeriesColor } from '@/common/charts/chartPalette';

interface GamesByModuleChartProps {
  data: GamesByModuleVM[];
}

const tooltipStyle = {
  backgroundColor: 'var(--color-bg-elevated)' as const,
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: 12,
  color: 'var(--color-text-primary)',
};

const axisTickStyle = {
  fill: 'var(--color-text-secondary)',
  fontSize: 12,
};

function formatModuleName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GamesByModuleChart = ({
  data,
}: GamesByModuleChartProps): ReactElement => {
  const { t } = useI18n();
  const charts = t.backoffice.games.charts;

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-[var(--color-text-muted)]">
        {charts.noModulePeriodData}
      </div>
    );
  }

  const chartData = data
    .filter((d) => d.avgAccuracy > 0)
    .map((d) => ({
      module:
        t.game.config.modules[d.module as keyof typeof t.game.config.modules] ??
        t.game.config.modules.random ??
        formatModuleName(d.module ?? ''),
      accuracy: d.avgAccuracy,
    }));

  return (
    <div
      className="w-full"
      style={{ height: Math.max(260, chartData.length * 56) }}
    >
      <p className="sr-only">
        {charts.qualityByModuleTitle}. {charts.qualityByModuleHint}
      </p>
      <div role="img" aria-hidden className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              strokeOpacity={0.5}
              horizontal={false}
            />
            <YAxis
              type="category"
              dataKey="module"
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ZAxis dataKey="accuracy" range={[80, 300]} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: unknown) => {
                const n =
                  typeof value === 'number' ? value : Number(value ?? 0);
                return [`${n.toFixed(1)}%`, charts.accuracyLegend];
              }}
            />
            <Scatter
              data={chartData}
              name={charts.accuracyLegend}
              fill={chartSeriesColor(1)}
              fillOpacity={0.8}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
