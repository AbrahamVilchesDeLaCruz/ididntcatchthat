import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccuracyProgressBar } from '../AccuracyProgressBar';

describe('AccuracyProgressBar', () => {
  it('exposes progressbar semantics with aria label and clamped value', () => {
    render(
      <AccuracyProgressBar value={150} ariaLabel="Module accuracy: 100%" />,
    );

    const bar = screen.getByRole('progressbar', {
      name: 'Module accuracy: 100%',
    });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps negative values to zero', () => {
    render(<AccuracyProgressBar value={-10} ariaLabel="Accuracy: 0%" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('uses green fill tone at 80% or above', () => {
    const { container } = render(
      <AccuracyProgressBar value={85} ariaLabel="Accuracy: 85%" />,
    );

    const fill = container.querySelector('[style*="width"]');
    expect(fill?.className).toContain('color-accent-green');
  });

  it('uses brand fill tone between 60% and 79%', () => {
    const { container } = render(
      <AccuracyProgressBar value={70} ariaLabel="Accuracy: 70%" />,
    );

    const fill = container.querySelector('[style*="width"]');
    expect(fill?.className).toContain('color-brand');
  });

  it('uses red fill tone below 60%', () => {
    const { container } = render(
      <AccuracyProgressBar value={40} ariaLabel="Accuracy: 40%" />,
    );

    const fill = container.querySelector('[style*="width"]');
    expect(fill?.className).toContain('color-accent-red');
  });
});
