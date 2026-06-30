import { type ReactElement } from 'react';
import { useAuthStore } from '@/core/store/auth.store';
import { useAchievements } from '@/core/achievements/useAchievements';
import { ProfileComponent } from './ProfileComponent';

export const ProfileContainer = (): ReactElement => {
  const userType = useAuthStore((s) => s.userType);
  const isGuest = userType === 'guest';
  const achievementsQuery = useAchievements(undefined, !isGuest);

  return (
    <ProfileComponent
      achievements={achievementsQuery.data ?? []}
      achievementsLoading={achievementsQuery.isLoading}
      showAchievements={!isGuest}
    />
  );
};
