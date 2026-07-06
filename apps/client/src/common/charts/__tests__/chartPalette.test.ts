import { describe, expect, it } from 'vitest';
import { CHART_SERIES_COLORS, chartSeriesColor } from '../chartPalette';

describe('chartPalette', () => {
  it('cycles through theme token colors', () => {
    expect(chartSeriesColor(0)).toBe(CHART_SERIES_COLORS[0]);
    expect(chartSeriesColor(CHART_SERIES_COLORS.length)).toBe(
      CHART_SERIES_COLORS[0],
    );
  });

  it('uses CSS variables instead of hardcoded hex values', () => {
    for (const color of CHART_SERIES_COLORS) {
      expect(color.startsWith('var(--color-chart-')).toBe(true);
    }
  });
});
