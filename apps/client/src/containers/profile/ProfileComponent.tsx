import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { ProfileHero } from './components/ProfileHero';
import { ProfileSectionHeading } from './components/ProfileSectionHeading';
import { ProfileRankingSection } from './components/ProfileRankingSection';
import { ProfilePreferencesSection } from './components/ProfilePreferencesSection';
import './profile-ui.css';

export const ProfileComponent = (): ReactElement => {
  const { t } = useI18n();
  const { canEditRankingProfile } = useCurrentUser();
  const sections = t.profile.sections;

  return (
    <div className="relative mx-auto max-w-4xl space-y-10 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-brand)] opacity-[0.05] blur-[100px]"
      />

      <ProfileHero />

      {canEditRankingProfile ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <section
            id="ranking"
            aria-labelledby="profile-ranking-heading"
            className="space-y-4"
          >
            <ProfileSectionHeading id="profile-ranking-heading">
              {sections.ranking}
            </ProfileSectionHeading>
            <ProfileRankingSection />
          </section>

          <aside
            aria-labelledby="profile-preferences-heading"
            className="space-y-4"
          >
            <ProfileSectionHeading id="profile-preferences-heading">
              {sections.preferences}
            </ProfileSectionHeading>
            <ProfilePreferencesSection />
          </aside>
        </div>
      ) : (
        <section
          aria-labelledby="profile-preferences-heading"
          className="mx-auto max-w-md space-y-4"
        >
          <ProfileSectionHeading id="profile-preferences-heading">
            {sections.preferences}
          </ProfileSectionHeading>
          <ProfilePreferencesSection />
        </section>
      )}
    </div>
  );
};
