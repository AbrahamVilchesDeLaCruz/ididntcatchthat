import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/core/store/auth.store';
import { ApiRequestError } from './apiError';
import { resolveApiBaseUrl } from './resolveApiBaseUrl';

export const apiBaseUrl = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
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
    response?: {
      status: number;
      data?: { message?: string; errorType?: string };
    };
  }) => {
    const originalRequest = error.config;
    const responseData = error.response?.data;

    const isGuest = useAuthStore.getState().guestDeviceId !== null;

    if (error.response?.status === 401 && !originalRequest._retry && !isGuest) {
      originalRequest._retry = true;
      try {
        const res = await axios.post<{ accessToken: string }>(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken } = res.data;
        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.replace('/auth/login');
      }
    }

    return Promise.reject(
      new ApiRequestError(
        String(
          responseData?.message ??
            (error as { message?: string }).message ??
            'Request failed',
        ),
        error.response?.status ?? 0,
        responseData?.errorType,
      ),
    );
  },
);
