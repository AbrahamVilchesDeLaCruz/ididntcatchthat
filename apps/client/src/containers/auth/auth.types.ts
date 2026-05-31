export type AuthMode = 'login' | 'register';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface RegisterFieldErrors {
  email?: string;
  password?: string;
  nickname?: string;
}
