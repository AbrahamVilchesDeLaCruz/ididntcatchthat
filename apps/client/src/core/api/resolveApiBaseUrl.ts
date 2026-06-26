export function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const trimmed = raw?.trim();

  if (!trimmed || trimmed === 'undefined') {
    return '/api/v1';
  }

  const base = trimmed.replace(/\/+$/, '');

  if (/\/v1$/i.test(base)) {
    return base;
  }

  if (/^https?:\/\//i.test(base)) {
    return `${base}/v1`;
  }

  return base;
}
