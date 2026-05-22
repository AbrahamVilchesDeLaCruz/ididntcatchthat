export type UserType = 'guest' | 'user' | 'teacher' | 'admin';

export type UserContext = {
  type: UserType;
  deviceId: string;
  fingerprint?: string;
  ip: string;
  userId?: string;
  email?: string;
  roles?: string[];
};
