import { useState } from 'react';
import {
  useRankings,
  useRankingProfile,
  useUpdateRankingProfile,
} from '../api';
import type {
  RankingModule,
  RankingPeriod,
  RankingProfileVM,
  RankingType,
} from '../ranking.types';

const defaultProfile = (): RankingProfileVM => ({
  showInRanking: false,
  nickname: '',
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useRankingState = () => {
  const [type, setType] = useState<RankingType>('most_active');
  const [period, setPeriod] = useState<RankingPeriod>('all_time');
  const [module, setModule] = useState<RankingModule>('native_sounds');
  const [profileOverride, setProfileOverride] =
    useState<RankingProfileVM | null>(null);
  const [profileSaveStatus, setProfileSaveStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const profileQuery = useRankingProfile();
  const profile = profileOverride ?? profileQuery.data ?? defaultProfile();

  const rankingsQuery = useRankings({
    type,
    period,
    module: type === 'module_master' ? module : undefined,
    limit: 10,
  });

  const updateProfile = useUpdateRankingProfile({
    onSuccess: () => {
      setProfileOverride(null);
      setProfileSaveStatus('success');
      window.setTimeout(() => setProfileSaveStatus('idle'), 3000);
    },
    onError: () => {
      setProfileSaveStatus('error');
      window.setTimeout(() => setProfileSaveStatus('idle'), 4000);
    },
  });

  return {
    type,
    setType,
    period,
    setPeriod,
    module,
    setModule,
    profile,
    setProfile: setProfileOverride,
    profileQuery,
    rankingsQuery,
    updateProfile,
    profileSaveStatus,
  };
};
