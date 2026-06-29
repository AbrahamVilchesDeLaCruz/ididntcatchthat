export const getUserInitials = (nickname: string): string => {
  const trimmed = nickname.trim();
  if (trimmed.length === 0) return '?';
  return trimmed.slice(0, 2).toUpperCase();
};
