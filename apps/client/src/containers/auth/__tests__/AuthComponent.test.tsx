import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthComponent } from '../AuthComponent';
import type { LoginFormValues, RegisterFormValues } from '../auth.types';

const defaultProps = {
  mode: 'login' as const,
  isLoading: false,
  error: null,
  onLogin: vi.fn(),
  onRegister: vi.fn(),
  onModeChange: vi.fn(),
  onGoogleLogin: vi.fn(),
};

describe('AuthComponent', () => {
  describe('modo login', () => {
    it('muestra campos de email y contraseña', () => {
      render(<AuthComponent {...defaultProps} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    });

    it('no muestra el formulario de registro en modo login', () => {
      render(<AuthComponent {...defaultProps} />);

      expect(screen.queryByLabelText(/nickname/i)).not.toBeInTheDocument();
    });

    it('llama onModeChange con "register" al pulsar el tab Registrarse', () => {
      const onModeChange = vi.fn();
      render(<AuthComponent {...defaultProps} onModeChange={onModeChange} />);

      fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

      expect(onModeChange).toHaveBeenCalledWith('register');
    });
  });

  describe('modo register', () => {
    it('muestra el formulario de registro', () => {
      render(<AuthComponent {...defaultProps} mode="register" />);

      expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    });

    it('llama onModeChange con "login" al pulsar el tab Iniciar sesión', () => {
      const onModeChange = vi.fn();
      render(
        <AuthComponent
          {...defaultProps}
          mode="register"
          onModeChange={onModeChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      expect(onModeChange).toHaveBeenCalledWith('login');
    });
  });

  describe('Google OAuth', () => {
    it('muestra el botón de Google en modo login', () => {
      render(<AuthComponent {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /continuar con google/i }),
      ).toBeInTheDocument();
    });

    it('muestra el botón de Google en modo register', () => {
      render(<AuthComponent {...defaultProps} mode="register" />);

      expect(
        screen.getByRole('button', { name: /continuar con google/i }),
      ).toBeInTheDocument();
    });

    it('llama onGoogleLogin al hacer clic en el botón de Google', () => {
      const onGoogleLogin = vi.fn();
      render(<AuthComponent {...defaultProps} onGoogleLogin={onGoogleLogin} />);

      fireEvent.click(
        screen.getByRole('button', { name: /continuar con google/i }),
      );

      expect(onGoogleLogin).toHaveBeenCalledOnce();
    });

    it('deshabilita el botón de Google cuando isLoading es true', () => {
      render(<AuthComponent {...defaultProps} isLoading={true} />);

      expect(
        screen.getByRole('button', { name: /continuar con google/i }),
      ).toBeDisabled();
    });
  });

  describe('error', () => {
    it('muestra el mensaje de error cuando error no es null', () => {
      render(
        <AuthComponent {...defaultProps} error="Credenciales incorrectas" />,
      );

      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });

    it('no muestra error cuando es null', () => {
      render(<AuthComponent {...defaultProps} error={null} />);

      expect(screen.queryByText(/credenciales/i)).not.toBeInTheDocument();
    });
  });

  describe('submit de login', () => {
    it('llama onLogin con los valores del formulario al hacer submit', () => {
      const onLogin = vi.fn();
      const { container } = render(
        <AuthComponent {...defaultProps} onLogin={onLogin} />,
      );

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' },
      });

      // Submit el form directamente — evita ambigüedad con el tab del mismo nombre
      const form = container.querySelector('form')!;
      fireEvent.submit(form);

      expect(onLogin).toHaveBeenCalledWith<[LoginFormValues]>({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  describe('submit de register', () => {
    it('llama onRegister con los valores del formulario al hacer submit', () => {
      const onRegister = vi.fn();
      render(
        <AuthComponent
          {...defaultProps}
          mode="register"
          onRegister={onRegister}
        />,
      );

      fireEvent.change(screen.getByLabelText(/nickname/i), {
        target: { value: 'pepito' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'pepito@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

      expect(onRegister).toHaveBeenCalledWith<[RegisterFormValues]>({
        nickname: 'pepito',
        email: 'pepito@test.com',
        password: 'password123',
      });
    });
  });
});
