import { useMemo, useState } from 'react';
import { z } from 'zod';
import { useI18n } from '@/core/i18n';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
  LoginFieldErrors,
  RegisterFieldErrors,
} from '../auth.types';

interface AuthFormState {
  mode: AuthMode;
  loginValues: LoginFormValues;
  registerValues: RegisterFormValues;
  loginFieldErrors: LoginFieldErrors;
  registerFieldErrors: RegisterFieldErrors;
}

interface AuthFormHandlers {
  setMode: (mode: AuthMode) => void;
  setLoginField: (field: keyof LoginFormValues, value: string) => void;
  setRegisterField: (field: keyof RegisterFormValues, value: string) => void;
  validateLogin: () => boolean;
  validateRegister: () => boolean;
}

export const useAuthForm = (
  initialMode: AuthMode,
  onClearServerError: () => void,
): [AuthFormState, AuthFormHandlers] => {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t.auth.validation.invalidEmail),
        password: z.string().min(1, t.auth.validation.passwordRequired),
      }),
    [t.auth.validation.invalidEmail, t.auth.validation.passwordRequired],
  );

  const registerSchema = useMemo(
    () =>
      z.object({
        nickname: z
          .string()
          .min(3, t.auth.validation.nicknameMin)
          .max(30, t.auth.validation.nicknameMax)
          .regex(/^[a-zA-Z0-9_]+$/, t.auth.validation.nicknamePattern),
        email: z.string().email(t.auth.validation.invalidEmail),
        password: z.string().min(8, t.auth.validation.passwordMin),
      }),
    [
      t.auth.validation.invalidEmail,
      t.auth.validation.nicknameMin,
      t.auth.validation.nicknameMax,
      t.auth.validation.nicknamePattern,
      t.auth.validation.passwordMin,
    ],
  );

  const [loginValues, setLoginValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });

  const [registerValues, setRegisterValues] = useState<RegisterFormValues>({
    email: '',
    password: '',
    nickname: '',
  });

  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>(
    {},
  );
  const [registerFieldErrors, setRegisterFieldErrors] =
    useState<RegisterFieldErrors>({});

  const setLoginField = (field: keyof LoginFormValues, value: string): void => {
    setLoginValues((prev) => ({ ...prev, [field]: value }));
    setLoginFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    onClearServerError();
  };

  const setRegisterField = (
    field: keyof RegisterFormValues,
    value: string,
  ): void => {
    setRegisterValues((prev) => ({ ...prev, [field]: value }));
    setRegisterFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    onClearServerError();
  };

  const validateLogin = (): boolean => {
    const result = loginSchema.safeParse(loginValues);
    if (result.success) {
      setLoginFieldErrors({});
      return true;
    }
    const errors: LoginFieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LoginFieldErrors;
      errors[field] = issue.message;
    }
    setLoginFieldErrors(errors);
    return false;
  };

  const validateRegister = (): boolean => {
    const result = registerSchema.safeParse(registerValues);
    if (result.success) {
      setRegisterFieldErrors({});
      return true;
    }
    const errors: RegisterFieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof RegisterFieldErrors;
      errors[field] = issue.message;
    }
    setRegisterFieldErrors(errors);
    return false;
  };

  return [
    {
      mode,
      loginValues,
      registerValues,
      loginFieldErrors,
      registerFieldErrors,
    },
    {
      setMode,
      setLoginField,
      setRegisterField,
      validateLogin,
      validateRegister,
    },
  ];
};
