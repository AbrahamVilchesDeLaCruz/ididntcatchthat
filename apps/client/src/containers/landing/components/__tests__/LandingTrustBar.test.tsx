import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { LandingTrustBar } from '../LandingTrustBar';

describe('LandingTrustBar', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
  });

  it('renders trust highlights from i18n', () => {
    render(<LandingTrustBar />);

    for (const item of en.landing.trustBar.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
