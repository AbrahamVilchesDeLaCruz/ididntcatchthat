import { type ReactElement } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
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

const MODULE_KEYS = [
  'random',
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
] as const;

export const GamesByModuleChart = ({
  data,
}: GamesByModuleChartProps): ReactElement => {
  const { t } = useI18n();
  const charts = t.backoffice.games.charts;

  const chartData = MODULE_KEYS.map((key) => {
    const match = data.find((d) => (d.module ?? 'random') === key);
    return {
      module: t.game.config.modules[key],
      accuracy: match?.avgAccuracy ?? 0,
    };
  });

  return (
    <div className="w-full" style={{ height: 260 + chartData.length * 8 }}>
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
              domain={[0, 100]}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: unknown) => {
                const n =
                  typeof value === 'number' ? value : Number(value ?? 0);
                return [`${n.toFixed(1)}%`, charts.accuracyLegend];
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              name={charts.accuracyLegend}
              strokeWidth={0}
              dot={{
                fill: chartSeriesColor(1),
                r: 6,
                strokeWidth: 0,
              }}
              activeDot={{
                fill: chartSeriesColor(1),
                r: 8,
                strokeWidth: 2,
                stroke: 'var(--color-bg-elevated)',
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
