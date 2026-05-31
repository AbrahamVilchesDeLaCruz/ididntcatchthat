import { useState } from 'react';
import { z } from 'zod';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
  LoginFieldErrors,
  RegisterFieldErrors,
} from '../auth.types';

const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const registerSchema = z.object({
  nickname: z
    .string()
    .min(3, 'El nickname debe tener al menos 3 caracteres')
    .max(30, 'El nickname no puede superar los 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

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
  const [mode, setMode] = useState<AuthMode>(initialMode);

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
    // Clear field error on change
    setLoginFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    onClearServerError();
  };

  const setRegisterField = (
    field: keyof RegisterFormValues,
    value: string,
  ): void => {
    setRegisterValues((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
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
