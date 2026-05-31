import { type ReactElement } from 'react';
import {
  BarChart,
  Bar,
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

export const GamesByModuleChart = ({
  data,
}: GamesByModuleChartProps): ReactElement => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
          />
          <XAxis
            dataKey="module"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Legend
            wrapperStyle={{
              color: 'var(--color-text-secondary)',
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="totalGames"
            name="Total partidas"
            fill="var(--color-brand)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="completedGames"
            name="Completadas"
            fill="var(--color-accent-green)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
