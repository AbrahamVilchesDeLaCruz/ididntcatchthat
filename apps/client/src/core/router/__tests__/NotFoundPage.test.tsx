import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import { NotFoundPage } from '../NotFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    useAuthStore.setState({ isAuthenticated: false });
  });

  it('shows a home link for guests', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: en.common.notFound.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: en.common.notFound.goHome }),
    ).toHaveAttribute('href', '/');
  });

  it('shows an app link for authenticated users', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: en.common.notFound.goApp }),
    ).toHaveAttribute('href', '/home');
  });
});
