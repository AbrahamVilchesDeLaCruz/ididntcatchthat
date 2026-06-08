import { type ReactElement } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ModuleProgressVM } from '../stats.types';

interface ModuleProgressChartProps {
  data: ModuleProgressVM[];
}

export const ModuleProgressChart = ({
  data,
}: ModuleProgressChartProps): ReactElement => {
  return (
    <div className="w-full h-64">
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
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
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
            formatter={(value) => {
              const num =
                typeof value === 'number' ? value : Number(value ?? 0);
              return [`${num.toFixed(1)}%`, 'Precisión'];
            }}
          />
          <Bar
            dataKey="accuracy"
            fill="var(--color-brand)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
