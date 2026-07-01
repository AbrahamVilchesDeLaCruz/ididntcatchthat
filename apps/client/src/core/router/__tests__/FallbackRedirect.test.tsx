import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/core/store/auth.store';
import { FallbackRedirect } from '../FallbackRedirect';

describe('FallbackRedirect', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
  });

  it('redirects authenticated users to /home', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <Routes>
          <Route path="/home" element={<div>Home page</div>} />
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('redirects guests to /', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <Routes>
          <Route path="/" element={<div>Landing page</div>} />
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Landing page')).toBeInTheDocument();
  });
});
