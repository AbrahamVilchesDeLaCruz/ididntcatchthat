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
  fontSize: 12,
};

const tickStyle = { fill: 'var(--color-text-secondary)', fontSize: 11 };

function formatModuleName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GamesByModuleChart = ({
  data,
}: GamesByModuleChartProps): ReactElement => {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-[var(--color-text-muted)]">
        {t.backoffice.games.charts.noModulePeriodData}
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
      role="img"
      aria-label={t.backoffice.games.charts.qualityByModuleTitle}
      style={{ width: '100%', height: Math.max(240, chartData.length * 52) }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 64, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            strokeOpacity={0.5}
            horizontal={false}
          />
          {/* Module names on Y-axis — readable in horizontal layout */}
          <YAxis
            type="category"
            dataKey="module"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            width={130}
          />
          {/* Left X-axis — game counts */}
          <XAxis
            xAxisId="count"
            type="number"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          {/* Right X-axis — accuracy % */}
          <XAxis
            xAxisId="accuracy"
            type="number"
            orientation="top"
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => {
              const n = typeof value === 'number' ? value : Number(value ?? 0);
              const label = String(name ?? '');
              return label === t.backoffice.games.charts.accuracyLegend
                ? [`${n.toFixed(1)}%`, label]
                : [n.toLocaleString(numberLocale), label];
            }}
          />
          <Legend
            wrapperStyle={{
              color: 'var(--color-text-secondary)',
              fontSize: 11,
            }}
          />
          <Bar
            xAxisId="count"
            dataKey="totalGames"
            name={t.backoffice.games.charts.gamesLegend}
            fill="var(--color-brand)"
            fillOpacity={0.8}
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
          />
          <Line
            xAxisId="accuracy"
            type="monotone"
            dataKey="avgAccuracy"
            name={t.backoffice.games.charts.accuracyLegend}
            stroke="var(--color-accent-red)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-accent-red)', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
