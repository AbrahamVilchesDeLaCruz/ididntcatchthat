import { useEffect, useState } from 'react';
import { useI18n } from '@/core/i18n';

function formatAgo(
  ms: number,
  labels: {
    justNow: string;
    seconds: string;
    minutes: string;
    hours: string;
  },
): string {
  const diff = Date.now() - ms;
  if (diff < 5_000) return labels.justNow;
  if (diff < 60_000) {
    return labels.seconds.replace('{count}', String(Math.floor(diff / 1_000)));
  }
  if (diff < 3_600_000) {
    return labels.minutes.replace('{count}', String(Math.floor(diff / 60_000)));
  }
  return labels.hours.replace('{count}', String(Math.floor(diff / 3_600_000)));
}

/** Returns a live-updating relative time string from a ms timestamp. */
export function useTimeAgo(timestamp: number | undefined): string {
  const { t } = useI18n();
  const labels = t.common.timeAgo;
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!timestamp) return;
    const tick = (): void => setLabel(formatAgo(timestamp, labels));
    tick();
    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, [timestamp, labels]);

  return label;
}
