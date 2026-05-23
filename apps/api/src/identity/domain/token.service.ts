import { type UserContext } from '@/shared/domain/user-context';

export type TokenPair = {
  accessToken: string;
  refreshTokenId: string;
};

export interface TokenService {
  generatePair(context: UserContext): TokenPair;
  generateGuest(context: Omit<UserContext, 'type' | 'userId'>): TokenPair;
}

export const TOKEN_SERVICE = Symbol('TokenService');
