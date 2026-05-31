export type Locale = 'en' | 'es';

export interface LandingTranslations {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaPlay: string;
    ctaHowItWorks: string;
    navBackoffice: string;
    navStats: string;
    navDashboard: string;
    navLogin: string;
    navRegister: string;
  };
  authGate: {
    title: string;
    subtitle: string;
    login: string;
    register: string;
    divider: string;
    guest: string;
    close: string;
  };
  gameDemo: {
    title: string;
    subtitle: string;
    hoverHint: string;
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

export interface GameTranslations {
  config: {
    title: string;
    subtitle: string;
    moduleLabel: string;
    countLabel: string;
    ctaStart: string;
    modules: {
      random: string;
      native_sounds: string;
      connecting_words: string;
      beautifying_sentences: string;
      sounding_native: string;
    };
  };
  play: {
    cardOf: string;
    correct: string;
    incorrect: string;
    hoverToReveal: string;
    tapToReveal: string;
    tapToFlipBack: string;
  };
  summary: {
    title: string;
    subtitleGood: string;
    subtitleKeepGoing: string;
    accuracy: string;
    correct: string;
    total: string;
    duration: string;
    ctaPlayAgain: string;
    ctaViewStats: string;
    ctaRegister: string;
    registerTitle: string;
    registerHint: string;
  };
}

export interface Translations {
  landing: LandingTranslations;
  game: GameTranslations;
}
