/** Matches fixed `LandingHeader` height + breathing room. */
export const LANDING_HEADER_SCROLL_OFFSET_PX = 72;

export function scrollToLandingSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const top =
    window.scrollY +
    el.getBoundingClientRect().top -
    LANDING_HEADER_SCROLL_OFFSET_PX;

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}
