export const achievementKeys = {
  all: ['achievements'] as const,
  // userId es parte obligatoria de la key: /achievements es per-user.
  // Sin scoping, TanStack serviría logros del usuario anterior al
  // cambiar de cuenta en el mismo navegador.
  list: (userId: string, since?: string) =>
    since
      ? (['achievements', 'list', userId, since] as const)
      : (['achievements', 'list', userId] as const),
};
