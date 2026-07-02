export const achievementKeys = {
  all: ['achievements'] as const,
  list: (since?: string) =>
    since
      ? (['achievements', 'list', since] as const)
      : (['achievements', 'list'] as const),
};
