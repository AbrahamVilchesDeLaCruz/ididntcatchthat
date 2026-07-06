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
import type { GamesByModuleVM } from '../backoffice-games.types';
import { useI18n } from '@/core/i18n';

interface GamesByModuleChartProps {
  data: GamesByModuleVM[];
}

const tooltipStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text-primary)',
  fontSize: 13,
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
  const { locale, t } = useI18n();
  const charts = t.backoffice.games.charts;
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-[var(--color-text-muted)]">
        {charts.noModulePeriodData}
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    module:
      t.game.config.modules[d.module as keyof typeof t.game.config.modules] ??
      formatModuleName(d.module),
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
          <ComposedChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
          >
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
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              label={{
                value: charts.gamesLegend,
                position: 'insideBottom',
                offset: -2,
                style: {
                  fill: 'var(--color-text-muted)',
                  fontSize: 11,
                },
              }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                const n =
                  typeof value === 'number' ? value : Number(value ?? 0);
                const label = String(name ?? '');
                return label === charts.accuracyLegend
                  ? [`${n.toFixed(1)}%`, label]
                  : [n.toLocaleString(numberLocale), label];
              }}
            />
            <Legend
              wrapperStyle={{
                color: 'var(--color-text-secondary)',
                fontSize: 12,
                paddingTop: 8,
              }}
            />
            <Bar
              dataKey="totalGames"
              name={charts.gamesLegend}
              fill="var(--color-chart-1)"
              fillOpacity={0.85}
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
            />
            <Line
              type="monotone"
              dataKey="avgAccuracy"
              name={charts.accuracyLegend}
              stroke="var(--color-chart-2)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-chart-2)', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
