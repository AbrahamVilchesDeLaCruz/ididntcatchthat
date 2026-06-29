import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '../useCurrentUser';

describe('useCurrentUser', () => {
  beforeEach(() => {
    useAuthStore.setState({
      userType: 'user',
      userId: 'user-1',
      roles: ['user'],
    });
  });

  it('allows ranking profile editing for player userType', () => {
    useAuthStore.setState({
      userType: 'user',
      userId: 'user-1',
      roles: [],
    });

    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.canEditRankingProfile).toBe(true);
    expect(result.current.canAccessRanking).toBe(true);
  });

  it('allows ranking access for admin accounts', () => {
    useAuthStore.setState({
      userType: 'admin',
      userId: 'admin-1',
      roles: ['admin'],
    });

    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.canAccessRanking).toBe(true);
  });

  it('denies ranking access for guests', () => {
    useAuthStore.setState({
      userType: 'guest',
      userId: 'guest-1',
      roles: ['guest'],
    });

    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.canAccessRanking).toBe(false);
  });
});
