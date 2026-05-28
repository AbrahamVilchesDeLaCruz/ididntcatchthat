import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type {
  AuthResponseApiModel,
  GuestAuthResponseApiModel,
  GuestAuthPayload,
  LoginPayload,
  MigrateGuestPayload,
  RegisterPayload,
} from './auth.api-model';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload): Promise<AuthResponseApiModel> =>
      apiClient
        .post<AuthResponseApiModel>('/auth/login', payload)
        .then((res) => res.data),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload): Promise<AuthResponseApiModel> =>
      apiClient
        .post<AuthResponseApiModel>('/auth/register', payload)
        .then((res) => res.data),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useLogout = () => {
  return useMutation({
    mutationFn: (): Promise<void> =>
      apiClient.post<void>('/auth/logout', {}).then((res) => res.data),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGuestAuth = () => {
  return useMutation({
    mutationFn: (
      payload: GuestAuthPayload,
    ): Promise<GuestAuthResponseApiModel> =>
      apiClient
        .post<GuestAuthResponseApiModel>('/auth/guest', payload)
        .then((res) => res.data),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useMigrateGuest = () => {
  return useMutation({
    mutationFn: (payload: MigrateGuestPayload): Promise<void> =>
      apiClient
        .post<void>('/auth/migrate-guest', payload)
        .then((res) => res.data),
  });
};
