import { create } from 'zustand';
import type {
  ModuleProgressVM,
  ProgressSummaryVM,
} from '@/containers/stats/stats.types';
import { computeStudyLevel } from './studyLevel';

export interface ProgressOptimisticSnapshot {
  sessionModule: string | null;
  sessionCardCount: number;
  pendingStudyViewIds: string[];
  extraStudyViews: number;
  extraStudySessions: number;
  extraGameAttempts: number;
  extraGamesCompleted: number;
}

interface ProgressOptimisticState extends ProgressOptimisticSnapshot {
  beginStudySession: (params: {
    module: string | null;
    cardCount: number;
  }) => void;
  recordStudyView: (flashcardId: string) => void;
  recordStudyComplete: () => void;
  recordGameAttempt: () => void;
  recordGameComplete: () => void;
  resetSession: () => void;
}

const sessionDefaults = {
  sessionModule: null as string | null,
  sessionCardCount: 0,
  pendingStudyViewIds: [] as string[],
};

const initialState: ProgressOptimisticSnapshot = {
  ...sessionDefaults,
  extraStudyViews: 0,
  extraStudySessions: 0,
  extraGameAttempts: 0,
  extraGamesCompleted: 0,
};

export const useProgressOptimisticStore = create<ProgressOptimisticState>(
  (set, get) => ({
    ...initialState,
    beginStudySession: ({ module, cardCount }) => {
      set({
        ...sessionDefaults,
        sessionModule: module,
        sessionCardCount: cardCount,
        extraStudyViews: get().extraStudyViews,
        extraStudySessions: get().extraStudySessions,
        extraGameAttempts: get().extraGameAttempts,
        extraGamesCompleted: get().extraGamesCompleted,
      });
    },
    recordStudyView: (flashcardId) => {
      set((state) => {
        if (state.pendingStudyViewIds.includes(flashcardId)) {
          return { extraStudyViews: state.extraStudyViews + 1 };
        }
        return {
          pendingStudyViewIds: [...state.pendingStudyViewIds, flashcardId],
          extraStudyViews: state.extraStudyViews + 1,
        };
      });
    },
    recordStudyComplete: () => {
      set((state) => ({
        ...sessionDefaults,
        extraStudyViews: state.extraStudyViews,
        extraStudySessions: state.extraStudySessions + 1,
        extraGameAttempts: state.extraGameAttempts,
        extraGamesCompleted: state.extraGamesCompleted,
      }));
    },
    recordGameAttempt: () => {
      set((state) => ({
        extraGameAttempts: state.extraGameAttempts + 1,
      }));
    },
    recordGameComplete: () => {
      set((state) => ({
        extraGamesCompleted: state.extraGamesCompleted + 1,
      }));
    },
    resetSession: () => {
      set((state) => ({
        ...sessionDefaults,
        extraStudyViews: state.extraStudyViews,
        extraStudySessions: state.extraStudySessions,
        extraGameAttempts: state.extraGameAttempts,
        extraGamesCompleted: state.extraGamesCompleted,
      }));
    },
  }),
);

export const selectProgressOptimistic = (
  state: ProgressOptimisticState,
): ProgressOptimisticSnapshot => ({
  sessionModule: state.sessionModule,
  sessionCardCount: state.sessionCardCount,
  pendingStudyViewIds: state.pendingStudyViewIds,
  extraStudyViews: state.extraStudyViews,
  extraStudySessions: state.extraStudySessions,
  extraGameAttempts: state.extraGameAttempts,
  extraGamesCompleted: state.extraGamesCompleted,
});

export function mergeModuleProgressWithOptimistic(
  modules: ModuleProgressVM[],
  optimistic: ProgressOptimisticSnapshot,
): ModuleProgressVM[] {
  if (
    optimistic.pendingStudyViewIds.length === 0 ||
    !optimistic.sessionModule
  ) {
    return modules;
  }

  const coverageBoost =
    optimistic.pendingStudyViewIds.length /
    Math.max(optimistic.sessionCardCount, 1);

  return modules.map((moduleProgress) => {
    if (moduleProgress.module !== optimistic.sessionModule) {
      return moduleProgress;
    }

    const studyCoverage = Math.min(
      1,
      moduleProgress.studyCoverage + coverageBoost,
    );

    return {
      ...moduleProgress,
      studyCoverage,
      studyLevel: computeStudyLevel(studyCoverage),
    };
  });
}

export function mergeProgressSummaryWithOptimistic(
  summary: ProgressSummaryVM,
  optimistic: ProgressOptimisticSnapshot,
): ProgressSummaryVM {
  const pendingActivity =
    optimistic.extraStudyViews + optimistic.extraGameAttempts;

  if (pendingActivity === 0 && optimistic.extraGamesCompleted === 0) {
    return summary;
  }

  return {
    ...summary,
    totalAttempts: summary.totalAttempts + pendingActivity,
    gamesCompleted: summary.gamesCompleted + optimistic.extraGamesCompleted,
  };
}
