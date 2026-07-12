import { render, screen, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '../toast.store';
import { ToastHost } from '../ToastHost';

describe('ToastHost', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  it('no renderiza nada si no hay toasts en el store', () => {
    const { container } = render(<ToastHost />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el mensaje de cada toast en el DOM cuando se hace push', () => {
    render(<ToastHost />);

    act(() => {
      useToastStore.getState().push({ message: 'Logo desbloqueado' });
      useToastStore.getState().push({
        message: 'Racha completada',
        category: 'streak',
      });
    });

    expect(screen.getByText('Logo desbloqueado')).toBeInTheDocument();
    expect(screen.getByText('Racha completada')).toBeInTheDocument();
  });

  it('remueve el toast del DOM al pulsar el botón dismiss', () => {
    render(<ToastHost />);

    act(() => {
      useToastStore.getState().push({ message: 'Acción confirmada' });
    });
    expect(screen.getByText('Acción confirmada')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: /dismiss/i }).click();
    });

    expect(screen.queryByText('Acción confirmada')).not.toBeInTheDocument();
  });

  it('auto-dismiss después de 5 segundos', () => {
    render(<ToastHost />);

    act(() => {
      useToastStore.getState().push({ message: 'Auto-dismiss' });
    });
    expect(screen.getByText('Auto-dismiss')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Auto-dismiss')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
