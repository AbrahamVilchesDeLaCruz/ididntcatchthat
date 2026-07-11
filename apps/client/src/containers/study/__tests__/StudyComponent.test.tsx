import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { StudyComponent } from '../StudyComponent';
import type { FlashcardGameVM } from '@/containers/game/game.types';

vi.mock('../hooks/useStudyKeyboardShortcuts', () => ({
  useStudyKeyboardShortcuts: vi.fn(),
}));

const flashcard: FlashcardGameVM = {
  id: 'fc-1',
  position: 1,
  expression: 'hello',
  meaning: 'hola',
  ipaNotation: '/həˈloʊ/',
  nativeSpeech: 'hello',
  audioUrls: {
    expression: { us: 'https://audio.test/us.mp3', uk: '', au: '' },
    examples: { us: 'https://audio.test/ex.mp3' },
  },
  examples: [],
};

const defaultProps = {
  flashcard,
  isLoading: false,
  isFlipped: false,
  currentIndex: 0,
  totalCount: 5,
  viewedCount: 1,
  onFlip: vi.fn(),
  onNext: vi.fn(),
};

describe('StudyComponent', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it('shows an accessible loading spinner while loading', () => {
    render(<StudyComponent {...defaultProps} isLoading flashcard={null} />);

    expect(
      screen.getByRole('status', { name: en.common.loading }),
    ).toBeInTheDocument();
  });

  it('renders the flashcard front when data is ready', () => {
    render(<StudyComponent {...defaultProps} />);

    expect(screen.getAllByText('Hello').length).toBeGreaterThan(0);
    expect(
      screen.getByText('Click or press Space to reveal'),
    ).toBeInTheDocument();
  });

  it('does NOT render the redundant "Listen native" button on the back', () => {
    render(<StudyComponent {...defaultProps} isFlipped />);

    expect(
      screen.queryByRole('button', { name: /Listen native/i }),
    ).not.toBeInTheDocument();
  });
});
