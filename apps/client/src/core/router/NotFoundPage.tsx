import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import { DEFAULT_AUTHENTICATED_HOME } from '@/core/auth/postLoginRedirect';
import { useAuthStore } from '@/core/store/auth.store';

export const NotFoundPage = (): ReactElement => {
  const { t } = useI18n();
  const nf = t.common.notFound;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)] px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        {nf.title}
      </h1>
      <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
        {nf.body}
      </p>
      <Link
        to={isAuthenticated ? DEFAULT_AUTHENTICATED_HOME : '/'}
        className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {isAuthenticated ? nf.goApp : nf.goHome}
      </Link>
    </main>
  );
};
