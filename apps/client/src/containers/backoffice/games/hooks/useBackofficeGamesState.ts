import { useGamesStats } from '../api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBackofficeGamesState() {
  const gamesStats = useGamesStats();

  return {
    gamesStats,
    isLoading: gamesStats.isLoading,
    isError: gamesStats.isError,
  };
}
