import { useEffect, useState } from 'react';

function formatAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 5_000) return 'ahora mismo';
  if (diff < 60_000) return `hace ${Math.floor(diff / 1_000)}s`;
  if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)}m`;
  return `hace ${Math.floor(diff / 3_600_000)}h`;
}

/** Returns a live-updating "hace Xs" string from a ms timestamp. */
export function useTimeAgo(timestamp: number | undefined): string {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!timestamp) return;
    const tick = (): void => setLabel(formatAgo(timestamp));
    tick();
    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, [timestamp]);

  return label;
}
