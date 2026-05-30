/**
 * Cookie TTL for refresh token — must match UserSession.TTL_DAYS (30 days).
 * Centralised here so all auth controllers share the same value.
 */
export const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
