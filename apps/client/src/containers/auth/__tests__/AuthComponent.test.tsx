import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthComponent } from '../AuthComponent';
import { useI18n } from '@/core/i18n';
import { es } from '@/core/i18n/es';
import { en } from '@/core/i18n/en';
import type { LoginFormValues, RegisterFormValues } from '../auth.types';

vi.mock('@/common/components/LocaleToggle', () => ({
  LocaleToggle: () => <div>Locale toggle</div>,
}));

const defaultProps = {
  mode: 'login' as const,
  isLoading: false,
  isGoogleLoading: false,
  error: null,
  onLogin: vi.fn(),
  onRegister: vi.fn(),
  onModeChange: vi.fn(),
  onGoogleLogin: vi.fn(),
  onClearError: vi.fn(),
};

describe('AuthComponent', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('muestra BrandWordmark con el nombre legible de la app', () => {
    render(<AuthComponent {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /I didn't catch that/i,
    );
  });

  describe('modo login', () => {
    it('muestra campos de email y contraseña', () => {
      render(<AuthComponent {...defaultProps} />);

      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('no muestra el formulario de registro en modo login', () => {
      render(<AuthComponent {...defaultProps} />);

      expect(screen.queryByLabelText(/^nickname$/i)).not.toBeInTheDocument();
    });

    it('llama onModeChange con "register" al pulsar el tab Sign up', () => {
      const onModeChange = vi.fn();
      render(<AuthComponent {...defaultProps} onModeChange={onModeChange} />);

      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

      expect(onModeChange).toHaveBeenCalledWith('register');
    });
  });

  describe('modo register', () => {
    it('muestra el formulario de registro', () => {
      render(<AuthComponent {...defaultProps} mode="register" />);

      expect(screen.getByLabelText(/^nickname$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('llama onModeChange con "login" al pulsar el tab Log in', () => {
      const onModeChange = vi.fn();
      render(
        <AuthComponent
          {...defaultProps}
          mode="register"
          onModeChange={onModeChange}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

      expect(onModeChange).toHaveBeenCalledWith('login');
    });
  });

  describe('Google OAuth', () => {
    it('muestra el botón de Google en modo login', () => {
      render(<AuthComponent {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /continue with google/i }),
      ).toBeInTheDocument();
    });

    it('muestra el botón de Google en modo register', () => {
      render(<AuthComponent {...defaultProps} mode="register" />);

      expect(
        screen.getByRole('button', { name: /continue with google/i }),
      ).toBeInTheDocument();
    });

    it('llama onGoogleLogin al hacer clic en el botón de Google', () => {
      const onGoogleLogin = vi.fn();
      render(<AuthComponent {...defaultProps} onGoogleLogin={onGoogleLogin} />);

      fireEvent.click(
        screen.getByRole('button', { name: /continue with google/i }),
      );

      expect(onGoogleLogin).toHaveBeenCalledOnce();
    });

    it('deshabilita el botón de Google cuando isLoading es true', () => {
      render(<AuthComponent {...defaultProps} isLoading={true} />);

      expect(
        screen.getByRole('button', { name: /continue with google/i }),
      ).toBeDisabled();
    });
  });

  describe('error', () => {
    it('muestra el mensaje de error cuando error no es null', () => {
      render(
        <AuthComponent
          {...defaultProps}
          error="Incorrect email or password."
        />,
      );

      expect(
        screen.getByText('Incorrect email or password.'),
      ).toBeInTheDocument();
    });

    it('no muestra error cuando es null', () => {
      render(<AuthComponent {...defaultProps} error={null} />);

      expect(screen.queryByText(/incorrect/i)).not.toBeInTheDocument();
    });

    it('uses error surface colors instead of success dim background', () => {
      render(
        <AuthComponent
          {...defaultProps}
          error="Incorrect email or password."
        />,
      );

      const alert = screen
        .getByText('Incorrect email or password.')
        .closest('div');
      expect(alert?.className).toContain('color-accent-red');
      expect(alert?.className).not.toContain('color-accent-green-dim');
    });
  });

  describe('submit de login', () => {
    it('llama onLogin con los valores del formulario al hacer submit', () => {
      const onLogin = vi.fn();
      const { container } = render(
        <AuthComponent {...defaultProps} onLogin={onLogin} />,
      );

      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });

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

      fireEvent.change(screen.getByLabelText(/^nickname$/i), {
        target: { value: 'pepito' },
      });
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'pepito@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(onRegister).toHaveBeenCalledWith<[RegisterFormValues]>({
        nickname: 'pepito',
        email: 'pepito@test.com',
        password: 'password123',
      });
    });

    it('no llama onRegister si la validación falla (campos vacíos)', () => {
      const onRegister = vi.fn();
      const { container } = render(
        <AuthComponent
          {...defaultProps}
          mode="register"
          onRegister={onRegister}
        />,
      );

      fireEvent.submit(container.querySelector('form')!);

      expect(onRegister).not.toHaveBeenCalled();
    });
  });

  describe('validación fallida en login', () => {
    it('no llama onLogin si la validación falla (campos vacíos)', () => {
      const onLogin = vi.fn();
      const { container } = render(
        <AuthComponent {...defaultProps} onLogin={onLogin} />,
      );

      fireEvent.submit(container.querySelector('form')!);

      expect(onLogin).not.toHaveBeenCalled();
    });
  });

  describe('show/hide password', () => {
    it('toggle muestra y oculta el campo contraseña en login', () => {
      render(<AuthComponent {...defaultProps} />);

      const input = screen.getByLabelText(/^password$/i);
      expect(input).toHaveAttribute('type', 'password');

      fireEvent.click(screen.getByRole('button', { name: /^show$/i }));
      expect(input).toHaveAttribute('type', 'text');

      fireEvent.click(screen.getByRole('button', { name: /^hide$/i }));
      expect(input).toHaveAttribute('type', 'password');
    });

    it('toggle muestra y oculta el campo contraseña en register', () => {
      render(<AuthComponent {...defaultProps} mode="register" />);

      const input = screen.getByLabelText(/^password$/i);
      expect(input).toHaveAttribute('type', 'password');

      fireEvent.click(screen.getByRole('button', { name: /^show$/i }));
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Google OAuth loading', () => {
    it('muestra "Redirecting…" cuando isGoogleLoading es true', () => {
      render(<AuthComponent {...defaultProps} isGoogleLoading={true} />);

      expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    });
  });

  describe('i18n', () => {
    it('muestra strings en español cuando el locale es es', () => {
      useI18n.setState({ locale: 'es', t: es });

      render(<AuthComponent {...defaultProps} />);

      expect(screen.getByText('Accede a tu cuenta')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continuar con google/i }),
      ).toBeInTheDocument();
    });
  });
});
