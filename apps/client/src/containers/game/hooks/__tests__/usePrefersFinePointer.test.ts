import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersFinePointer } from '../usePrefersFinePointer';

describe('usePrefersFinePointer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when fine pointer media query matches', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { result } = renderHook(() => usePrefersFinePointer());

    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    let currentMatches = false;
    const listeners = new Set<() => void>();

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        get matches() {
          return currentMatches;
        },
        addEventListener: (_: string, listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_: string, listener: () => void) => {
          listeners.delete(listener);
        },
      })),
    );

    const { result } = renderHook(() => usePrefersFinePointer());
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });
});
