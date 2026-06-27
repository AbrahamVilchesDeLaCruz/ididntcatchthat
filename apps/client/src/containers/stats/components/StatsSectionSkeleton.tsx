import { type ReactElement } from 'react';

interface StatsSectionSkeletonProps {
  height?: string;
}

export const StatsSectionSkeleton = ({
  height = 'h-64',
}: StatsSectionSkeletonProps): ReactElement => (
  <div
    className={`${height} w-full animate-pulse rounded-lg bg-[var(--color-bg-elevated)]`}
  />
);
