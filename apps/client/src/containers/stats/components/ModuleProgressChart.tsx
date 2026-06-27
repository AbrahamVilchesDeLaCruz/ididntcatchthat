import { type ReactElement, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useI18n } from '@/core/i18n';
import { MasteryBadge } from './MasteryBadge';
import type { ModuleProgressVM } from '../stats.types';
import type { GameModule } from '@/containers/game/api/game.api-model';

interface ModuleProgressChartProps {
  data: ModuleProgressVM[];
  onCategoryClick?: (category: string) => void;
}

type ChartRow = ModuleProgressVM & { moduleLabel: string };

export const ModuleProgressChart = ({
  data,
  onCategoryClick,
}: ModuleProgressChartProps): ReactElement => {
  const { t } = useI18n();

  const chartData = useMemo<ChartRow[]>(
    () =>
      data.map((row) => ({
        ...row,
        moduleLabel:
          t.game.config.modules[row.module as GameModule] ?? row.module,
      })),
    [data, t],
  );

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-2">
        {chartData.map((row) => (
          <div key={row.module} className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)]">
              {row.moduleLabel}
            </span>
            <MasteryBadge level={row.masteryLevel} />
          </div>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.08)"
            />
            <XAxis
              dataKey="moduleLabel"
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
              formatter={(value, _name, item) => {
                const num =
                  typeof value === 'number' ? value : Number(value ?? 0);
                const row = item.payload as ChartRow;
                return [
                  `${num.toFixed(1)}% · ${row.totalAttempts} intentos`,
                  t.stats.moduleChartTitle,
                ];
              }}
            />
            <Bar
              dataKey="accuracy"
              fill="var(--color-brand)"
              radius={[4, 4, 0, 0]}
              cursor={onCategoryClick ? 'pointer' : undefined}
              onClick={(_barData, index) => {
                const row = chartData[index];
                if (row?.module && onCategoryClick) {
                  onCategoryClick(row.module);
                }
              }}
            >
              {chartData.map((row) => (
                <Cell key={row.module} fill="var(--color-brand)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
