/** First character uppercased; rest unchanged. */
export const capitalizeFirst = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.length === 0) return text;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};
