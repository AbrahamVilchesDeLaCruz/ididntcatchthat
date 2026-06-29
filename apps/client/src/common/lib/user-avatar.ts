/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- dicebear ESM types are incomplete in this toolchain */
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/avataaars';

export const createUserAvatarDataUri = (userId: string): string =>
  createAvatar(avataaars, {
    seed: userId,
    size: 128,
  }).toDataUri();

export const getUserInitials = (nickname: string): string => {
  const trimmed = nickname.trim();
  if (trimmed.length === 0) return '?';
  return trimmed.slice(0, 2).toUpperCase();
};
