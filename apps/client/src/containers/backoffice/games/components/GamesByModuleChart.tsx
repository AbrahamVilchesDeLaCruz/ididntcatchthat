import { type ReactElement, useMemo } from 'react';
import {
  BarChart,
  Bar,
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

const MODULE_KEYS = [
  'random',
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
] as const;

const axisTickStyle = {
  fill: 'var(--color-text-secondary)',
  fontSize: 12,
};

const dotShape = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
}: Record<string, number | string>): ReactElement => (
  <circle
    cx={(x as number) + (width as number) / 2}
    cy={(y as number) + (height as number) / 2}
    r={8}
    fill={chartSeriesColor(0)}
    stroke="var(--color-bg-card)"
    strokeWidth={2}
  />
);

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: unknown }>;
  label?: string;
}): ReactElement | null => {
  if (!active || !payload || payload.length === 0) return null;

  const raw = payload[0]?.value;
  const formattedValue =
    typeof raw === 'number'
      ? `${raw.toFixed(1)}%`
      : `${Number(raw ?? 0).toFixed(1)}%`;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-primary)',
          fontWeight: 600,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
        {formattedValue}
      </p>
    </div>
  );
};

export const GamesByModuleChart = ({
  data,
}: GamesByModuleChartProps): ReactElement => {
  const { t } = useI18n();

  const chartData = useMemo(() => {
    const lookup = new Map(
      data.map((d) => [d.module ?? 'random', d.avgAccuracy]),
    );
    return MODULE_KEYS.map((key) => ({
      module: t.game.config.modules[key] ?? key,
      accuracy: lookup.get(key) ?? 0,
    }));
  }, [data, t.game.config.modules]);

  return (
    <div
      className="overflow-hidden w-full"
      style={{ height: Math.max(220, chartData.length * 56) }}
    >
      <p className="sr-only">
        {t.backoffice.games.charts.qualityByModuleTitle}.{' '}
        {t.backoffice.games.charts.qualityByModuleHint}
      </p>
      <div role="img" aria-hidden className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              type="category"
              dataKey="module"
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              type="number"
              domain={[0, 100]}
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={40}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                fill: 'var(--color-bg-elevated)',
                fillOpacity: 0.4,
              }}
            />
            <Bar
              dataKey="accuracy"
              shape={dotShape}
              maxBarSize={8}
              background={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
