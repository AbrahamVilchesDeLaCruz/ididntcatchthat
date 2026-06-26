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
    subcategoryLabel: string;
    wholeCategory: string;
    countLabel: string;
    ctaStart: string;
    guestError: string;
    guestRetry: string;
    pausedSaved: string;
    hudSetupLabel: string;
    modules: {
      random: string;
      native_sounds: string;
      connected_speech: string;
      flow_connectors: string;
      real_talk: string;
    };
  };
  paused: {
    title: string;
    cards: string;
    continue: string;
    abandon: string;
    abandonConfirm: string;
    cancel: string;
    randomModule: string;
    maxModalTitle: string;
    maxModalBody: string;
    abandonOldest: string;
    chooseToAbandon: string;
  };
  play: {
    cardOf: string;
    correct: string;
    incorrect: string;
    hoverToReveal: string;
    tapToReveal: string;
    tapToFlipBack: string;
    pause: string;
    listenExample: string;
    listenNative: string;
    micSoon: string;
    pausedToast: string;
    sidebarTitle: string;
    progressLabel: string;
    shortcutsTitle: string;
    shortcutFlip: string;
    shortcutCorrect: string;
    shortcutIncorrect: string;
    shortcutPause: string;
    hudCardLabel: string;
    clickToReveal: string;
    audioDialectUs: string;
    audioDialectUk: string;
    audioDialectAu: string;
    playExample: string;
    sessionTimerLabel: string;
    touchSwipeIncorrect: string;
    touchSwipeCorrect: string;
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
    ctaChooseModule: string;
    ctaViewStats: string;
    ctaRegister: string;
    registerTitle: string;
    registerHint: string;
    pausedGamesLink: string;
    hudVictoryLabel: string;
  };
}

export interface StatsTranslations {
  title: string;
  subtitle: string;
  moduleChartTitle: string;
  moduleChartHint: string;
  weakTableTitle: string;
  noModuleData: string;
  noWeakData: string;
  noWeakInModule: string;
  noSubcategoryData: string;
  emptyGlobalTitle: string;
  emptyGlobalBody: string;
  emptyGlobalCta: string;
  retry: string;
  loadError: string;
  backToModules: string;
  subcategoryTitleSuffix: string;
  practice: string;
  table: {
    expression: string;
    module: string;
    errors: string;
    lastAttempt: string;
  };
  mastery: {
    novice: string;
    progressing: string;
    solid: string;
    mastered: string;
  };
}

export interface RankingTranslations {
  title: string;
  subtitle: string;
  profile: {
    title: string;
    showNickname: string;
    nicknamePlaceholder: string;
    save: string;
    saving: string;
    saved: string;
    saveError: string;
  };
  filters: {
    type: string;
    period: string;
    module: string;
  };
  types: Record<
    | 'most_active'
    | 'most_accurate'
    | 'top_scorer'
    | 'best_streak'
    | 'module_master',
    string
  >;
  periods: Record<'weekly' | 'monthly' | 'all_time', string>;
  table: {
    rank: string;
    player: string;
    score: string;
    you: string;
  };
  scoreUnits: {
    most_active: string;
    most_accurate: string;
    top_scorer: string;
    best_streak: string;
    module_master: string;
  };
  loading: string;
  error: string;
  empty: string;
  emptyOptInHint: string;
  emptyMostActiveHint: string;
  outsideTopHint: string;
  yourPosition: string;
  periodIgnoredHint: string;
}

export interface Translations {
  landing: LandingTranslations;
  game: GameTranslations;
  stats: StatsTranslations;
  ranking: RankingTranslations;
}
