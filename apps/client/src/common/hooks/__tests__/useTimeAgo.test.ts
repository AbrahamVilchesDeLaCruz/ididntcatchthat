import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { en } from '@/core/i18n/en';
import { useI18n } from '@/core/i18n';
import { useTimeAgo } from '../useTimeAgo';

describe('useTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-05T12:00:00.000Z'));
    useI18n.setState({ locale: 'en', t: en });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string when timestamp is undefined', () => {
    const { result } = renderHook(() => useTimeAgo(undefined));
    expect(result.current).toBe('');
  });

  it('returns just now for timestamps within 5 seconds', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimeAgo(now - 2_000));
    expect(result.current).toBe('just now');
  });

  it('returns seconds ago for timestamps within a minute', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimeAgo(now - 30_000));
    expect(result.current).toBe('30s ago');
  });

  it('returns minutes ago for timestamps within an hour', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimeAgo(now - 15 * 60_000));
    expect(result.current).toBe('15m ago');
  });

  it('returns hours ago for older timestamps', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimeAgo(now - 3 * 3_600_000));
    expect(result.current).toBe('3h ago');
  });
});
