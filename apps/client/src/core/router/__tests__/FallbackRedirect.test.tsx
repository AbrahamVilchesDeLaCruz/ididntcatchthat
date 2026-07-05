import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { FallbackRedirect } from '../FallbackRedirect';

describe('FallbackRedirect', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders the not-found page instead of silently redirecting', () => {
    render(
      <MemoryRouter>
        <FallbackRedirect />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: en.common.notFound.title }),
    ).toBeInTheDocument();
  });
});
