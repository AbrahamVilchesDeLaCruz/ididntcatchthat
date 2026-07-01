import { useQuery } from '@tanstack/react-query';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { apiClient } from '@/core/api/apiClient';
import { mapUserStats } from '../backoffice-users.mapper';
import type { UserStatsApiModel } from './backoffice-users.api-model';
import type { UserStatsPeriod } from '../backoffice-users.types';

export const backofficeUsersKeys = {
  stats: (period: UserStatsPeriod) =>
    ['backoffice', 'users', 'stats', period] as const,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUserPageStats = (period: UserStatsPeriod = '7d') => {
  return useQuery({
    queryKey: backofficeUsersKeys.stats(period),
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<UserStatsApiModel>>(`/users/stats?period=${period}`)
        .then((res) => res.data.data),
    select: mapUserStats,
  });
};
