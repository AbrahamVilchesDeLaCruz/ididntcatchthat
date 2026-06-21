export const ALL_TIME_BUCKET = 'all';
export const ROLLING_BUCKET = 'rolling';

const PERIODS = ['weekly', 'monthly', 'all_time'] as const;

export type RankingPeriodValue = (typeof PERIODS)[number];

export class RankingPeriodBucket {
  static bucketFor(period: string): string {
    return period === 'all_time' ? ALL_TIME_BUCKET : ROLLING_BUCKET;
  }

  static sinceDate(period: string, at: Date): Date | null {
    if (period === 'all_time') return null;
    if (period === 'weekly') {
      return new Date(at.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === 'monthly') {
      return new Date(at.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
  }

  static periodsForType(type: string): RankingPeriodValue[] {
    if (type === 'best_streak' || type === 'module_master') {
      return ['all_time'];
    }
    return [...PERIODS];
  }

  static allPeriods(): RankingPeriodValue[] {
    return [...PERIODS];
  }
}
