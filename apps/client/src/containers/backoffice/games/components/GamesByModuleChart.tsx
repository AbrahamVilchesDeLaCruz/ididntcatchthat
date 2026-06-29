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

interface GamesByModuleChartProps {
  data: GamesByModuleVM[];
}

const EmptyChart = (): ReactElement => (
  <div className="flex items-center justify-center h-64 text-xs text-[var(--color-text-muted)]">
    Sin datos de módulos para este período
  </div>
);

const tooltipStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text-primary)',
  fontSize: 12,
};

const axisTickStyle = {
  fill: 'var(--color-text-secondary)',
  fontSize: 12,
};

export const GamesByModuleChart = ({
  data,
}: GamesByModuleChartProps): ReactElement => {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 48, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="module"
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
          />
          {/* Left axis — counts */}
          <YAxis
            yAxisId="left"
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
          />
          {/* Right axis — accuracy % */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => {
              const n = typeof value === 'number' ? value : Number(value ?? 0);
              const label = String(name ?? '');
              return label === 'Precisión media'
                ? [`${n.toFixed(1)}%`, label]
                : [n.toLocaleString('es-ES'), label];
            }}
          />
          <Legend
            wrapperStyle={{
              color: 'var(--color-text-secondary)',
              fontSize: 12,
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="totalGames"
            name="Total partidas"
            fill="var(--color-brand)"
            opacity={0.85}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="completedGames"
            name="Completadas"
            fill="var(--color-accent-green)"
            opacity={0.85}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgAccuracy"
            name="Precisión media"
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
