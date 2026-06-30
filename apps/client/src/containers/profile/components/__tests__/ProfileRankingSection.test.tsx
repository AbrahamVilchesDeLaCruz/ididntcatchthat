import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ProfileRankingSection />
      </QueryClientProvider>
    </MemoryRouter>,
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

  it('updates show in ranking from visibility toggle', () => {
    renderSection();

    fireEvent.click(
      screen.getByRole('button', { name: /hidden from leaderboards/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(mutate).toHaveBeenCalledWith({
      nickname: 'Ace',
      showInRanking: false,
    });
  });

  it('keeps save disabled until the form changes', () => {
    renderSection();

    expect(
      screen.getByRole('button', { name: /save profile/i }),
    ).toBeDisabled();
  });

  it('discards unsaved changes', () => {
    renderSection();

    fireEvent.change(screen.getByLabelText(/public nickname/i), {
      target: { value: 'DraftNick' },
    });
    fireEvent.click(screen.getByRole('button', { name: /discard/i }));

    expect(screen.getByLabelText(/public nickname/i)).toHaveValue('Ace');
    expect(
      screen.getByRole('button', { name: /save profile/i }),
    ).toBeDisabled();
  });
});
