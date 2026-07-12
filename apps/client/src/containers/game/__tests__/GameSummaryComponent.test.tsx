import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { GameSummaryComponent } from '../GameSummaryComponent';
import type { GameSummaryVM } from '../game.types';

const summary: GameSummaryVM = {
  correctCount: 8,
  totalCount: 10,
  accuracy: 0.8,
  duration: 95,
  cardsViewed: 10,
};

const defaultHandlers = {
  onPlayAgain: vi.fn(),
  onChooseModule: vi.fn(),
  onRegister: vi.fn(),
  onViewStats: vi.fn(),
};

describe('GameSummaryComponent', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    vi.clearAllMocks();
  });

  it('calls onChooseModule instead of onPlayAgain for registered users', async () => {
    const user = userEvent.setup();

    render(
      <GameSummaryComponent
        summary={summary}
        isGuest={false}
        {...defaultHandlers}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: en.game.summary.ctaChooseModule }),
    );

    expect(defaultHandlers.onChooseModule).toHaveBeenCalledOnce();
    expect(defaultHandlers.onPlayAgain).not.toHaveBeenCalled();
  });

  it('calls onPlayAgain when play again is clicked for registered users', async () => {
    const user = userEvent.setup();

    render(
      <GameSummaryComponent
        summary={summary}
        isGuest={false}
        {...defaultHandlers}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: en.game.summary.ctaPlayAgain }),
    );

    expect(defaultHandlers.onPlayAgain).toHaveBeenCalledOnce();
    expect(defaultHandlers.onChooseModule).not.toHaveBeenCalled();
  });

  it('shows keep-going subtitle when accuracy is below 70%', () => {
    render(
      <GameSummaryComponent
        summary={{ ...summary, accuracy: 0.5 }}
        isGuest={false}
        {...defaultHandlers}
      />,
    );

    expect(
      screen.getByText(en.game.summary.subtitleKeepGoing),
    ).toBeInTheDocument();
  });

  it('shows guest register CTA and play again without choose module', () => {
    render(
      <GameSummaryComponent summary={summary} isGuest {...defaultHandlers} />,
    );

    expect(
      screen.getByRole('button', { name: en.game.summary.ctaRegister }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.game.summary.ctaPlayAgain }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: en.game.summary.ctaChooseModule }),
    ).not.toBeInTheDocument();
  });

  it('NO muestra el campo Duration — los juegos pausados no tienen tiempo activo real', () => {
    render(
      <GameSummaryComponent
        summary={summary}
        isGuest={false}
        {...defaultHandlers}
      />,
    );

    expect(
      screen.queryByText(en.game.summary.duration),
    ).not.toBeInTheDocument();
  });

  it('NO usa emojis para el accuracy header — usa un icono SVG (lucide) accesible', () => {
    render(
      <GameSummaryComponent
        summary={summary}
        isGuest={false}
        {...defaultHandlers}
      />,
    );

    const rendered = document.body.textContent ?? '';
    // El emoji 🔥/💪/📈/🎯 no debe aparecer suelto como texto del header.
    expect(rendered).not.toMatch(/^🔥$/u);
    expect(rendered).not.toMatch(/^💪$/u);
    expect(rendered).not.toMatch(/^📈$/u);
    expect(rendered).not.toMatch(/^🎯$/u);

    // El icono debe ser un SVG accesible (aria-hidden o título semántico).
    const headerIcons = document.querySelectorAll(
      'h1 ~ * svg, .summary-accuracy-icon svg',
    );
    expect(headerIcons.length).toBeGreaterThan(0);
  });
});
