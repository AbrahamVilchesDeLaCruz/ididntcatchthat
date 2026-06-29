import type { GameSummaryVM } from './game.types';

const STORAGE_PREFIX = 'game-summary:';

const EMPTY_SUMMARY: GameSummaryVM = {
  correctCount: 0,
  totalCount: 0,
  accuracy: 0,
  duration: 0,
  cardsViewed: 0,
};

function storageKey(gameId: string): string {
  return `${STORAGE_PREFIX}${gameId}`;
}

function isGameSummaryVM(value: unknown): value is GameSummaryVM {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.correctCount === 'number' &&
    typeof v.totalCount === 'number' &&
    typeof v.accuracy === 'number' &&
    typeof v.duration === 'number' &&
    typeof v.cardsViewed === 'number'
  );
}

export function saveGameSummary(gameId: string, summary: GameSummaryVM): void {
  try {
    sessionStorage.setItem(storageKey(gameId), JSON.stringify(summary));
  } catch {
    // sessionStorage may be unavailable or full — summary still works via navigation state
  }
}

export function readGameSummary(gameId: string): GameSummaryVM | null {
  try {
    const raw = sessionStorage.getItem(storageKey(gameId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGameSummaryVM(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearGameSummary(gameId: string): void {
  try {
    sessionStorage.removeItem(storageKey(gameId));
  } catch {
    // ignore
  }
}

export function resolveGameSummary(
  gameId: string | undefined,
  fromNavigation: GameSummaryVM | undefined,
): GameSummaryVM {
  if (fromNavigation) return fromNavigation;
  if (gameId) {
    const stored = readGameSummary(gameId);
    if (stored) return stored;
  }
  return EMPTY_SUMMARY;
}
