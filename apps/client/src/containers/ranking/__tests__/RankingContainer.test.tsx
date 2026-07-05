import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useRankingState } from '../hooks';
import { RankingContainer } from '../RankingContainer';

const refetch = vi.fn();

vi.mock('../hooks', () => ({
  useRankingState: vi.fn(() => ({
    type: 'most_active',
    setType: vi.fn(),
    period: 'weekly',
    setPeriod: vi.fn(),
    module: 'native_sounds',
    setModule: vi.fn(),
    rankingsQuery: {
      isError: true,
      refetch,
      data: undefined,
    },
  })),
}));

vi.mock('../RankingComponent', () => ({
  RankingComponent: () => <div>Ranking content</div>,
}));

const mockedUseRankingState = vi.mocked(useRankingState);

describe('RankingContainer', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    refetch.mockClear();
    mockedUseRankingState.mockReturnValue({
      type: 'most_active',
      setType: vi.fn(),
      period: 'weekly',
      setPeriod: vi.fn(),
      module: 'native_sounds',
      setModule: vi.fn(),
      rankingsQuery: {
        isError: true,
        refetch,
        data: undefined,
      },
    } as unknown as ReturnType<typeof useRankingState>);
  });

  it('shows retry when rankings fail to load', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RankingContainer />
      </MemoryRouter>,
    );

    expect(screen.getByText(en.ranking.error)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: en.ranking.retry }));

    expect(refetch).toHaveBeenCalledOnce();
  });

  it('renders rankings when the query succeeds', () => {
    mockedUseRankingState.mockReturnValue({
      type: 'most_active',
      setType: vi.fn(),
      period: 'weekly',
      setPeriod: vi.fn(),
      module: 'native_sounds',
      setModule: vi.fn(),
      rankingsQuery: {
        isError: false,
        isLoading: false,
        isFetching: false,
        refetch,
        data: {
          entries: [],
          currentUser: null,
          viewer: {
            showInRanking: true,
            nickname: 'Player',
            rank: null,
            score: null,
            status: 'visible_unranked',
          },
        },
      },
    } as unknown as ReturnType<typeof useRankingState>);

    render(
      <MemoryRouter>
        <RankingContainer />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ranking content')).toBeInTheDocument();
  });
});
