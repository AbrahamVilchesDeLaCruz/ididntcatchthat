import { useState, type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { RegisterFormValues, RegisterFieldErrors } from '../auth.types';

interface AuthRegisterFormProps {
  values: RegisterFormValues;
  fieldErrors: RegisterFieldErrors;
  isLoading: boolean;
  onFieldChange: (field: keyof RegisterFormValues, value: string) => void;
  onSubmit: () => void;
}

export const AuthRegisterForm = ({
  values,
  fieldErrors,
  isLoading,
  onFieldChange,
  onSubmit,
}: AuthRegisterFormProps): ReactElement => {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit();
  };

  const isDisabled =
    isLoading || !values.email || !values.password || !values.nickname;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
        >
          {t.auth.fields.nickname}
        </label>
        <input
          id="nickname"
          type="text"
          autoComplete="username"
          autoFocus
          value={values.nickname}
          onChange={(e) => onFieldChange('nickname', e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:border-transparent transition ${
            fieldErrors.nickname
              ? 'border-[var(--color-accent-red)]/60 focus:ring-[var(--color-accent-red)]/30'
              : 'border-[var(--color-border)] focus:ring-[var(--color-brand-dim)]'
          }`}
          placeholder={t.auth.fields.nicknamePlaceholder}
        />
        {fieldErrors.nickname ? (
          <p className="mt-1 text-xs text-[var(--color-accent-red)]">
            {fieldErrors.nickname}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {t.auth.register.nicknameHint}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-email"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
        >
          {t.auth.fields.email}
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:border-transparent transition ${
            fieldErrors.email
              ? 'border-[var(--color-accent-red)]/60 focus:ring-[var(--color-accent-red)]/30'
              : 'border-[var(--color-border)] focus:ring-[var(--color-brand-dim)]'
          }`}
          placeholder={t.auth.fields.emailPlaceholder}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-password"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
        >
          {t.auth.fields.password}
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => onFieldChange('password', e.target.value)}
            className={`w-full px-4 py-2.5 pr-10 rounded-lg bg-[var(--color-bg-elevated)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:border-transparent transition ${
              fieldErrors.password
                ? 'border-[var(--color-accent-red)]/60 focus:ring-[var(--color-accent-red)]/30'
                : 'border-[var(--color-border)] focus:ring-[var(--color-brand-dim)]'
            }`}
            placeholder={t.auth.fields.passwordMinPlaceholder}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
            aria-label={
              showPassword
                ? t.auth.fields.hidePassword
                : t.auth.fields.showPassword
            }
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full py-2.5 px-4 bg-[var(--color-brand)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            {t.auth.register.submitting}
          </span>
        ) : (
          t.auth.register.submit
        )}
      </button>
    </form>
  );
};
