import { useState } from 'react';
import { useRankings } from '../api';
import type {
  RankingModule,
  RankingPeriod,
  RankingType,
} from '../ranking.types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useRankingState = () => {
  const [type, setType] = useState<RankingType>('most_active');
  const [period, setPeriod] = useState<RankingPeriod>('all_time');
  const [module, setModule] = useState<RankingModule>('native_sounds');

  const rankingsQuery = useRankings({
    type,
    period,
    module: type === 'module_master' ? module : undefined,
    limit: 10,
  });

  return {
    type,
    setType,
    period,
    setPeriod,
    module,
    setModule,
    rankingsQuery,
  };
};
