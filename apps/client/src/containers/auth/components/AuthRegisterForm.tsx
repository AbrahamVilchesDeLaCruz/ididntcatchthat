import { type ReactElement } from 'react';
import type { RegisterFormValues } from '../auth.types';

interface AuthRegisterFormProps {
  values: RegisterFormValues;
  isLoading: boolean;
  onFieldChange: (field: keyof RegisterFormValues, value: string) => void;
  onSubmit: () => void;
}

export const AuthRegisterForm = ({
  values,
  isLoading,
  onFieldChange,
  onSubmit,
}: AuthRegisterFormProps): ReactElement => {
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={30}
          value={values.nickname}
          onChange={(e) => onFieldChange('nickname', e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
          placeholder="tu_nickname"
        />
      </div>

      <div>
        <label
          htmlFor="reg-email"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="reg-password"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Contraseña
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={values.password}
          onChange={(e) => onFieldChange('password', e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
};
