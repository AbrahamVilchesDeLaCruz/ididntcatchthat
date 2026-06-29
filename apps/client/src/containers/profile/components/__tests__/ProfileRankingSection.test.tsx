import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useRankingProfile,
  useUpdateRankingProfile,
} from '@/core/profile/useRankingProfile';
import { ProfileRankingSection } from '../ProfileRankingSection';

vi.mock('@/core/profile/useRankingProfile', () => ({
  useRankingProfile: vi.fn(),
  useUpdateRankingProfile: vi.fn(),
}));

const mockedUseRankingProfile = vi.mocked(useRankingProfile);
const mockedUseUpdateRankingProfile = vi.mocked(useUpdateRankingProfile);

const renderSection = (): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileRankingSection />
    </QueryClientProvider>,
  );
};

describe('ProfileRankingSection', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    mutate.mockReset();
    mockedUseRankingProfile.mockReturnValue({
      data: { nickname: 'Ace', showInRanking: true },
      isLoading: false,
    } as ReturnType<typeof useRankingProfile>);
    mockedUseUpdateRankingProfile.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateRankingProfile>);
  });

  it('saves nickname from profile form', async () => {
    renderSection();

    fireEvent.change(screen.getByLabelText(/public nickname/i), {
      target: { value: 'NewNick' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        nickname: 'NewNick',
        showInRanking: true,
      });
    });
  });

  it('updates show in ranking from switch', () => {
    renderSection();

    fireEvent.click(
      screen.getByRole('switch', { name: /show me in rankings/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(mutate).toHaveBeenCalledWith({
      nickname: 'Ace',
      showInRanking: false,
    });
  });
});
