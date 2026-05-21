export type Locale = 'en' | 'es';

export interface LandingTranslations {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  problem: {
    sectionLabel: string;
    headline: string;
    subheadline: string;
    duolingoLabel: string;
    duolingoDescription: string;
    weTeachLabel: string;
    weTeachDescription: string;
    exampleLabel: string;
    exampleWritten: string;
    exampleNative: string;
    exampleTag: string;
  };
  howItWorks: {
    sectionLabel: string;
    headline: string;
    subheadline: string;
    steps: [
      { number: '01'; title: string; description: string },
      { number: '02'; title: string; description: string },
      { number: '03'; title: string; description: string },
      { number: '04'; title: string; description: string },
    ];
  };
  modules: {
    sectionLabel: string;
    headline: string;
    subheadline: string;
    items: [
      { title: string; tag: string; description: string },
      { title: string; tag: string; description: string },
      { title: string; tag: string; description: string },
      { title: string; tag: string; description: string },
    ];
  };
  notify: {
    sectionLabel: string;
    headline: string;
    subheadline: string;
    inputPlaceholder: string;
    ctaButton: string;
    disclaimer: string;
  };
  footer: {
    tagline: string;
  };
}

export interface Translations {
  landing: LandingTranslations;
}
