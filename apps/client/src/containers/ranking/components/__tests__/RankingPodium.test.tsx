import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RankingPodium } from '../RankingPodium';
import type { RankingEntryVM } from '../../ranking.types';

const entries: RankingEntryVM[] = [
  {
    rank: 1,
    userId: 'user-1',
    nickname: 'Champion',
    score: 120,
    isMe: true,
  },
  {
    rank: 2,
    userId: 'user-2',
    nickname: 'Runner',
    score: 95,
    isMe: false,
  },
  {
    rank: 3,
    userId: 'user-3',
    nickname: 'Bronze',
    score: 80,
    isMe: false,
  },
];

describe('RankingPodium', () => {
  it('renders three podium slots with top player labels', () => {
    render(<RankingPodium type="most_active" entries={entries} />);

    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
    expect(screen.getByText('3rd')).toBeInTheDocument();
    expect(screen.getByText('Champion')).toBeInTheDocument();
    expect(screen.getByText('Runner')).toBeInTheDocument();
    expect(screen.getByText('Bronze')).toBeInTheDocument();
  });

  it('shows You badge on the current user podium slot', () => {
    render(<RankingPodium type="most_active" entries={entries} />);

    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('returns null when there are no top-three entries', () => {
    const { container } = render(
      <RankingPodium type="most_active" entries={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
