import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@/common/lib/user-avatar', () => ({
  createUserAvatarDataUri: (): string => 'data:image/svg+xml,mock-avatar',
  getUserInitials: (nickname: string): string => {
    const trimmed = nickname.trim();
    if (trimmed.length === 0) return '?';
    return trimmed.slice(0, 2).toUpperCase();
  },
}));
