import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { StudySummaryComponent } from '../StudySummaryComponent';
import type { StudySummaryVM } from '../study.types';

const summary: StudySummaryVM = {
  cardsViewed: 10,
  totalCount: 10,
  duration: 95,
};

const defaultHandlers = {
  onStudyAgain: vi.fn(),
  onPlayGame: vi.fn(),
};

describe('StudySummaryComponent', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    vi.clearAllMocks();
  });

  it('llama onStudyAgain al pulsar "Study again"', async () => {
    const user = userEvent.setup();
    render(
      <StudySummaryComponent
        summary={summary}
        currentStreak={3}
        {...defaultHandlers}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: en.study.summary.studyAgain }),
    );

    expect(defaultHandlers.onStudyAgain).toHaveBeenCalledOnce();
  });

  it('NO muestra el campo Duration — los sessions pausadas no tienen tiempo activo real', () => {
    render(
      <StudySummaryComponent
        summary={summary}
        currentStreak={0}
        {...defaultHandlers}
      />,
    );

    expect(
      screen.queryByText(en.study.summary.duration),
    ).not.toBeInTheDocument();
  });
});
