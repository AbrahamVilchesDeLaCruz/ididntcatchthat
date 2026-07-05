import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { RankingComponent } from '../RankingComponent';
import type {
  RankingEntryVM,
  RankingModule,
  RankingPeriod,
  RankingType,
  RankingViewerVM,
} from '../ranking.types';

vi.mock('../components/RankingFilters', () => ({
  RankingFilters: () => <div>Ranking filters</div>,
}));

vi.mock('../components/RankingLeaderboard', () => ({
  RankingLeaderboard: () => <div>Ranking leaderboard</div>,
}));

const entry: RankingEntryVM = {
  rank: 1,
  userId: 'user-1',
  nickname: 'Champion',
  score: 120,
  isMe: true,
};

const defaultViewer: RankingViewerVM = {
  showInRanking: true,
  nickname: 'Champion',
  rank: 1,
  score: 120,
  status: 'ranked',
};

const defaultProps = {
  type: 'most_active' as RankingType,
  period: 'weekly' as RankingPeriod,
  module: 'native_sounds' as RankingModule,
  entries: [entry],
  currentUser: {
    rank: 1,
    userId: 'user-1',
    nickname: 'Champion',
    score: 120,
  },
  viewer: defaultViewer,
  isRankingsLoading: false,
  isRankingsFetching: false,
  onTypeChange: vi.fn(),
  onPeriodChange: vi.fn(),
  onModuleChange: vi.fn(),
};

function renderRanking(
  overrides: Partial<typeof defaultProps> = {},
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <RankingComponent {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );
}

describe('RankingComponent', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('shows an accessible loading spinner while rankings load', () => {
    renderRanking({ isRankingsLoading: true, entries: [] });

    expect(
      screen.getByRole('status', { name: en.ranking.loading }),
    ).toBeInTheDocument();
  });

  it('shows empty state with most-active hint', () => {
    renderRanking({ entries: [], type: 'most_active' });

    expect(screen.getByText(en.ranking.empty)).toBeInTheDocument();
    expect(
      screen.getByText(en.ranking.emptyMostActiveHint),
    ).toBeInTheDocument();
  });

  it('shows hidden viewer card with profile action', async () => {
    const user = userEvent.setup();

    renderRanking({
      viewer: { ...defaultViewer, status: 'hidden' },
      entries: [],
    });

    expect(screen.getByText(en.ranking.viewer.hiddenTitle)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: en.ranking.viewer.hiddenAction }),
    );
  });

  it('shows visible-unranked viewer banner', () => {
    renderRanking({
      viewer: { ...defaultViewer, status: 'visible_unranked' },
      entries: [],
    });

    expect(
      screen.getByText(en.ranking.viewer.visibleUnrankedTitle),
    ).toBeInTheDocument();
  });

  it('shows ranked position when user is in the leaderboard', () => {
    renderRanking();

    expect(screen.getByText(/#1/)).toBeInTheDocument();
    expect(screen.getByText('Ranking leaderboard')).toBeInTheDocument();
  });

  it('shows outside-top banner when user is ranked but not in list', () => {
    renderRanking({
      entries: [{ ...entry, isMe: false, userId: 'user-2', nickname: 'Other' }],
      currentUser: {
        rank: 42,
        userId: 'user-1',
        nickname: 'Champion',
        score: 10,
      },
    });

    expect(
      screen.getByText(en.ranking.viewer.rankedOutsideTitle),
    ).toBeInTheDocument();
    expect(screen.getByText(/#42/)).toBeInTheDocument();
  });

  it('shows empty state without most-active hint for other ranking types', () => {
    renderRanking({ entries: [], type: 'top_scorer' });

    expect(screen.getByText(en.ranking.empty)).toBeInTheDocument();
    expect(
      screen.queryByText(en.ranking.emptyMostActiveHint),
    ).not.toBeInTheDocument();
  });
});
