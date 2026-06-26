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
import { useI18n } from '@/core/i18n';
import { useFlashcardCatalog } from '@/core/api/flashcard-catalog.api';
import type { SubcategoryProgressVM } from '../stats.types';

interface SubcategoryProgressPanelProps {
  category: string;
  data: SubcategoryProgressVM[];
  onBack: () => void;
}

type ChartRow = SubcategoryProgressVM & { subcategoryLabel: string };

export const SubcategoryProgressPanel = ({
  category,
  data,
  onBack,
}: SubcategoryProgressPanelProps): ReactElement => {
  const { t, locale } = useI18n();
  const { data: catalog } = useFlashcardCatalog();

  const filtered = useMemo(
    () => data.filter((row) => row.category === category),
    [category, data],
  );

  const chartData = useMemo<ChartRow[]>(() => {
    const categoryMeta = catalog?.categories.find((c) => c.value === category);
    return filtered.map((row) => {
      const subMeta = categoryMeta?.subcategories.find(
        (s) => s.value === row.subcategory,
      );
      return {
        ...row,
        subcategoryLabel: subMeta?.label[locale] ?? row.subcategory,
      };
    });
  }, [catalog, category, filtered, locale]);

  const categoryLabel =
    t.game.config.modules[category as keyof typeof t.game.config.modules] ??
    category;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          {categoryLabel} — subcategorías
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--color-brand)] hover:underline"
        >
          ← Volver al resumen
        </button>
      </div>

      {chartData.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
          Sin datos de subcategorías para este módulo
        </p>
      ) : (
        <div className="w-full h-64">
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
                dataKey="subcategoryLabel"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
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
      )}
    </div>
  );
};
