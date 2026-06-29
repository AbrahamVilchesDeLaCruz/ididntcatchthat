import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { ProfileAccountSection } from './components/ProfileAccountSection';
import { ProfileRankingSection } from './components/ProfileRankingSection';
import { ProfilePreferencesSection } from './components/ProfilePreferencesSection';

export const ProfileComponent = (): ReactElement => {
  const { t } = useI18n();
  const { isUser } = useCurrentUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {t.profile.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t.profile.subtitle}
        </p>
      </div>

      <ProfileAccountSection />
      {isUser ? <ProfileRankingSection /> : null}
      <ProfilePreferencesSection />
    </div>
  );
};
