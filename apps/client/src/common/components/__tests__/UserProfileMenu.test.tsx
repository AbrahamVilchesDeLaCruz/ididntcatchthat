import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/core/store/auth.store';
import { useProfileDialogStore } from '@/core/profile/useProfileDialogStore';
import {
  useRankingProfile,
  useUpdateRankingProfile,
} from '@/core/profile/useRankingProfile';
import { UserProfileMenu } from '../UserProfileMenu';

vi.mock('@/core/profile/useRankingProfile', () => ({
  useRankingProfile: vi.fn(),
  useUpdateRankingProfile: vi.fn(),
}));

const mockedUseRankingProfile = vi.mocked(useRankingProfile);
const mockedUseUpdateRankingProfile = vi.mocked(useUpdateRankingProfile);

const renderMenu = (): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UserProfileMenu />
    </QueryClientProvider>,
  );
};

describe('UserProfileMenu', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    mutate.mockReset();
    useProfileDialogStore.setState({ open: false });
    useAuthStore.setState({
      userType: 'user',
      userId: 'user-123',
    });
    mockedUseRankingProfile.mockReturnValue({
      data: { nickname: 'Ace', showInRanking: true },
      isLoading: false,
    } as ReturnType<typeof useRankingProfile>);
    mockedUseUpdateRankingProfile.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateRankingProfile>);
  });

  it('opens profile dialog and saves nickname', async () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: /ace/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Your player profile')).toBeInTheDocument();

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

  it('updates show in ranking preference from the switch', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: /ace/i }));
    fireEvent.click(
      screen.getByRole('switch', { name: /show me in rankings/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(mutate).toHaveBeenCalledWith({
      nickname: 'Ace',
      showInRanking: false,
    });
  });

  it('does not render for guest users', () => {
    useAuthStore.setState({ userType: 'guest', userId: 'guest-1' });

    const { container } = renderMenu();

    expect(container).toBeEmptyDOMElement();
  });
});
