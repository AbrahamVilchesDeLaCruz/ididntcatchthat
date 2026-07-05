import { useEffect, useMemo, type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useRankingProfile } from '@/core/profile/useRankingProfile';
import { markHomeEntered } from '@/core/navigation/sessionNav';
import type { HomeActionCardVM } from './home.types';
import { HomeComponent } from './HomeComponent';

export const HomeContainer = (): ReactElement => {
  const { t } = useI18n();
  const h = t.home;
  const {
    isGuest,
    isTeacher,
    isAdmin,
    canStudy,
    canAccessBackoffice,
    canManageFlashcards,
    canAccessObservability,
    canAccessRanking,
    canEditRankingProfile,
  } = useCurrentUser();
  const profileQuery = useRankingProfile({ enabled: canEditRankingProfile });

  useEffect(() => {
    markHomeEntered();
  }, []);

  const roleLabel = isAdmin
    ? h.roles.admin
    : isTeacher
      ? h.roles.teacher
      : isGuest
        ? h.roles.guest
        : h.roles.user;

  const welcomeName = profileQuery.data?.nickname.trim()
    ? profileQuery.data.nickname
    : roleLabel;

  const quickStartSteps = useMemo((): [string, string, string] => {
    if (isAdmin || isTeacher) {
      return [
        h.quickStartSteps[0],
        h.quickStartSteps[1],
        isAdmin
          ? h.actions.flashcards.description
          : h.actions.backofficeGames.description,
      ];
    }
    return h.quickStartSteps;
  }, [h, isAdmin, isTeacher]);

  const actionCards = useMemo((): HomeActionCardVM[] => {
    const cards: HomeActionCardVM[] = [
      {
        id: 'play',
        title: h.actions.play.title,
        description: h.actions.play.description,
        to: '/game',
      },
    ];

    if (canStudy) {
      cards.push({
        id: 'study',
        title: h.actions.study.title,
        description: h.actions.study.description,
        to: '/study',
      });
    }

    cards.push({
      id: 'stats',
      title: h.actions.stats.title,
      description: h.actions.stats.description,
      to: '/stats',
    });

    if (canAccessRanking) {
      cards.push({
        id: 'ranking',
        title: h.actions.ranking.title,
        description: h.actions.ranking.description,
        to: '/ranking',
      });
    }

    cards.push({
      id: 'profile',
      title: h.actions.profile.title,
      description: h.actions.profile.description,
      to: '/profile',
    });

    if (canAccessBackoffice) {
      cards.push({
        id: 'backoffice',
        title: h.actions.backofficeGames.title,
        description: h.actions.backofficeGames.description,
        to: '/backoffice/games',
      });
    }

    if (canManageFlashcards) {
      cards.push({
        id: 'flashcards',
        title: h.actions.flashcards.title,
        description: h.actions.flashcards.description,
        to: '/backoffice/flashcards',
      });
    }

    if (canAccessObservability) {
      cards.push({
        id: 'observability',
        title: h.actions.observability.title,
        description: h.actions.observability.description,
        to: '/backoffice/observability',
      });
    }

    return cards;
  }, [
    h,
    canStudy,
    canAccessRanking,
    canAccessBackoffice,
    canManageFlashcards,
    canAccessObservability,
  ]);

  return (
    <HomeComponent
      roleLabel={roleLabel}
      welcomeName={welcomeName}
      quickStartSteps={quickStartSteps}
      actionCards={actionCards}
    />
  );
};
