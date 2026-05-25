import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/core/store/auth.store';

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1',
  withCredentials: true, // para cookies httpOnly (refreshToken)
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: {
    config: AxiosRequestConfig & {
      _retry?: boolean;
      headers: Record<string, string>;
    };
    response?: { status: number };
  }) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken } = res.data;
        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(
      new Error(
        String((error as { message?: string }).message ?? 'Request failed'),
      ),
    );
  },
);
