import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  LANDING_HEADER_SCROLL_OFFSET_PX,
  scrollToLandingSection,
} from '../landingScroll';

describe('scrollToLandingSection', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls with header offset when section exists', () => {
    const section = document.createElement('section');
    section.id = 'how-it-works';
    document.body.appendChild(section);

    Object.defineProperty(section, 'getBoundingClientRect', {
      value: () => ({ top: 200 }),
    });
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

    scrollToLandingSection('how-it-works');

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 100 + 200 - LANDING_HEADER_SCROLL_OFFSET_PX,
      behavior: 'smooth',
    });

    section.remove();
  });

  it('does nothing when section is missing', () => {
    scrollToLandingSection('missing-section');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
