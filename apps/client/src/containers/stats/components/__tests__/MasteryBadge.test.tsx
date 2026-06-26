import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MasteryBadge } from '../MasteryBadge';

describe('MasteryBadge', () => {
  it('renders mastered label for level 3', () => {
    render(<MasteryBadge level={3} />);
    expect(screen.getByText('Mastered')).toBeInTheDocument();
  });

  it('clamps level below 0 to novice', () => {
    render(<MasteryBadge level={-1} />);
    expect(screen.getByText('Novice')).toBeInTheDocument();
  });
});
