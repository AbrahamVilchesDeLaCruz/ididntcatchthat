import { type ReactElement, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import type { AchievementVM } from '@/core/achievements/achievement.types';
import { ProfileHero } from './components/ProfileHero';
import { ProfileAchievementsSection } from './components/ProfileAchievementsSection';
import { ProfileRankingSection } from './components/ProfileRankingSection';
import { ProfilePreferencesSection } from './components/ProfilePreferencesSection';
import { ProfileTabs, type ProfileTabId } from './components/ProfileTabs';
import './profile-ui.css';

interface ProfileComponentProps {
  achievements: AchievementVM[];
  achievementsLoading: boolean;
  showAchievements: boolean;
}

function hashToTab(hash: string): ProfileTabId | null {
  if (hash === '#achievements') return 'achievements';
  if (hash === '#ranking') return 'ranking';
  if (hash === '#preferences') return 'preferences';
  return null;
}

export const ProfileComponent = ({
  achievements,
  achievementsLoading,
  showAchievements,
}: ProfileComponentProps): ReactElement => {
  const { t } = useI18n();
  const { canEditRankingProfile } = useCurrentUser();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const sections = t.profile.sections;

  const availableTabs = useMemo((): ProfileTabId[] => {
    const tabs: ProfileTabId[] = [];
    if (showAchievements) tabs.push('achievements');
    if (canEditRankingProfile) tabs.push('ranking');
    tabs.push('preferences');
    return tabs;
  }, [canEditRankingProfile, showAchievements]);

  const defaultTab = availableTabs[0] ?? 'preferences';

  const activeTab = useMemo((): ProfileTabId => {
    const fromHash = hashToTab(hash);
    if (fromHash && availableTabs.includes(fromHash)) return fromHash;
    return defaultTab;
  }, [availableTabs, defaultTab, hash]);

  const tabItems = useMemo(
    () =>
      availableTabs.map((id) => ({
        id,
        label: sections[id],
      })),
    [availableTabs, sections],
  );

  const selectTab = (tab: ProfileTabId): void => {
    void navigate({ pathname: '/profile', hash: `#${tab}` }, { replace: true });
  };

  const panelContent = (() => {
    switch (activeTab) {
      case 'achievements':
        return (
          <ProfileAchievementsSection
            achievements={achievements}
            isLoading={achievementsLoading}
          />
        );
      case 'ranking':
        return <ProfileRankingSection />;
      case 'preferences':
        return <ProfilePreferencesSection />;
      default:
        return null;
    }
  })();

  return (
    <div className="relative mx-auto max-w-4xl pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-brand)] opacity-[0.05] blur-[100px]"
      />

      <div className="mb-8">
        <ProfileHero />
      </div>

      <ProfileTabs
        tabs={tabItems}
        activeTab={activeTab}
        onTabChange={selectTab}
        ariaLabel={t.profile.tabsAriaLabel}
      >
        {panelContent}
      </ProfileTabs>
    </div>
  );
};
