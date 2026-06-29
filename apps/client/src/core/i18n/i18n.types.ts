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
    ctaStudy: string;
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
    failedCardsTitle: string;
    ctaPracticeWeakest: string;
  };
}

export interface StatsTranslations {
  title: string;
  subtitle: string;
  moduleChartTitle: string;
  moduleChartHint: string;
  attemptsLabel: string;
  studyCoverageLabel: string;
  subcategoryHint: string;
  practiceSubcategory: string;
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
  weakestCta: string;
  weakestGuestCta: string;
  hero: {
    streak: string;
    streakHint: string;
    accuracy7d: string;
    weakCount: string;
    weakHint: string;
    mastered: string;
    gamesHint: string;
  };
  guest: {
    title: string;
    subtitle: string;
    games: string;
    attempts: string;
    accuracy: string;
    failed: string;
    emptyTitle: string;
    emptyBody: string;
    registerTitle: string;
    registerHint: string;
    registerCta: string;
  };
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
  studyLevel: {
    novice: string;
    progressing: string;
    solid: string;
    explored: string;
  };
}

export interface AchievementsTranslations {
  title: string;
}

export interface ProfileMenuTranslations {
  title: string;
  description: string;
  fallbackNickname: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  showInRankingLabel: string;
  showInRankingHint: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
}

export interface RankingTranslations {
  title: string;
  subtitle: string;
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
  podium: {
    first: string;
    second: string;
    third: string;
  };
  viewer: {
    hiddenTitle: string;
    hiddenDescription: string;
    hiddenAction: string;
    visibleUnrankedTitle: string;
    visibleUnrankedDescription: string;
    rankedOutsideTitle: string;
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
  emptyMostActiveHint: string;
  outsideTopHint: string;
  yourPosition: string;
  periodIgnoredHint: string;
}

export interface StudyTranslations {
  config: {
    title: string;
    subtitle: string;
    moduleLabel: string;
    subcategoryLabel: string;
    wholeCategory: string;
    countLabel: string;
    ctaStart: string;
    ctaStarting: string;
    pausedSaved: string;
  };
  play: {
    next: string;
    sessionLabel: string;
    progressLabel: string;
    shortcutNext: string;
    tapNext: string;
    markAndContinue: string;
    pause: string;
  };
  summary: {
    title: string;
    subtitle: string;
    cardsViewed: string;
    duration: string;
    streak: string;
    studyAgain: string;
    playGame: string;
  };
}

export interface CommonTranslations {
  theme: {
    lightMode: string;
    darkMode: string;
    activateLight: string;
    activateDark: string;
  };
  locale: {
    switchLanguage: string;
    english: string;
    spanish: string;
  };
}

export interface SidebarTranslations {
  sections: {
    game: string;
    study: string;
    progress: string;
    backoffice: string;
    system: string;
  };
  nav: {
    home: string;
    play: string;
    study: string;
    stats: string;
    ranking: string;
    gameMetrics: string;
    userMetrics: string;
    flashcards: string;
    observability: string;
  };
  logout: string;
}

export interface ProfileTranslations {
  title: string;
  subtitle: string;
  account: {
    title: string;
    roleUser: string;
    roleTeacher: string;
    roleAdmin: string;
    userIdLabel: string;
  };
  preferences: {
    title: string;
    themeLabel: string;
    localeLabel: string;
  };
}

export interface HomeTranslations {
  title: string;
  subtitle: string;
  quickStartTitle: string;
  quickStartSteps: [string, string, string];
  actionsTitle: string;
  navApp: string;
  roles: {
    user: string;
    teacher: string;
    admin: string;
  };
  actions: {
    play: { title: string; description: string };
    study: { title: string; description: string };
    stats: { title: string; description: string };
    ranking: { title: string; description: string };
    profile: { title: string; description: string };
    backofficeGames: { title: string; description: string };
    flashcards: { title: string; description: string };
    observability: { title: string; description: string };
  };
}

export interface Translations {
  landing: LandingTranslations;
  game: GameTranslations;
  study: StudyTranslations;
  stats: StatsTranslations;
  achievements: AchievementsTranslations;
  profileMenu: ProfileMenuTranslations;
  profile: ProfileTranslations;
  home: HomeTranslations;
  ranking: RankingTranslations;
  common: CommonTranslations;
  sidebar: SidebarTranslations;
}
