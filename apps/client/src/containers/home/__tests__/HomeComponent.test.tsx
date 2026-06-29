import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { HomeComponent } from '../HomeComponent';
import type { HomeActionCardVM } from '../home.types';

const cards: HomeActionCardVM[] = [
  {
    id: 'play',
    title: 'Play',
    description: 'Arcade',
    to: '/game',
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Settings',
    to: '/profile',
  },
];

describe('HomeComponent', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders welcome and action cards', () => {
    render(
      <MemoryRouter>
        <HomeComponent
          roleLabel="Player"
          welcomeName="Ace"
          quickStartSteps={['Step 1', 'Step 2', 'Step 3']}
          actionCards={cards}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Welcome, Ace/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /play/i })).toHaveAttribute(
      'href',
      '/game',
    );
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
      'href',
      '/profile',
    );
  });
});
