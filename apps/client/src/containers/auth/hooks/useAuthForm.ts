import { useState } from 'react';
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from '../auth.types';

interface AuthFormState {
  mode: AuthMode;
  loginValues: LoginFormValues;
  registerValues: RegisterFormValues;
}

interface AuthFormHandlers {
  setMode: (mode: AuthMode) => void;
  setLoginField: (field: keyof LoginFormValues, value: string) => void;
  setRegisterField: (field: keyof RegisterFormValues, value: string) => void;
}

export const useAuthForm = (
  initialMode: AuthMode,
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

  const setLoginField = (field: keyof LoginFormValues, value: string): void => {
    setLoginValues((prev) => ({ ...prev, [field]: value }));
  };

  const setRegisterField = (
    field: keyof RegisterFormValues,
    value: string,
  ): void => {
    setRegisterValues((prev) => ({ ...prev, [field]: value }));
  };

  return [
    { mode, loginValues, registerValues },
    { setMode, setLoginField, setRegisterField },
  ];
};
