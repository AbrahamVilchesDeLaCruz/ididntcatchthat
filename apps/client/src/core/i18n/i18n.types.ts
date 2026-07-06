export type Locale = 'en' | 'es';

export interface LandingTranslations {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    subheadline: string;
    ctaPlay: string;
    ctaSignUp: string;
    ctaStudy: string;
    ctaHowItWorks: string;
    ctaGetStarted: string;
    navBackoffice: string;
    navStats: string;
    navDashboard: string;
    navLogin: string;
    navRegister: string;
  };
  trustBar: {
    items: [string, string, string];
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
    tapHint: string;
    cards: [
      {
        expression: string;
        ipa: string;
        meaning: string;
        exampleEn: string;
        exampleEs: string;
      },
      {
        expression: string;
        ipa: string;
        meaning: string;
        exampleEn: string;
        exampleEs: string;
      },
    ];
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
    exampleWrittenLabel: string;
    exampleNativeLabel: string;
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
      {
        title: string;
        tag: string;
        description: string;
        examples: [string, string, string];
      },
      {
        title: string;
        tag: string;
        description: string;
        examples: [string, string, string];
      },
      {
        title: string;
        tag: string;
        description: string;
        examples: [string, string, string];
      },
      {
        title: string;
        tag: string;
        description: string;
        examples: [string, string, string];
      },
    ];
  };
  finalCta: {
    sectionLabel: string;
    headline: string;
    subheadline: string;
    ctaSignUp: string;
    ctaPlay: string;
  };
  footer: {
    tagline: string;
    navHowItWorks: string;
    navGetStarted: string;
    navLogin: string;
    navRegister: string;
    accents: string;
  };
  header: {
    explore: string;
    start: string;
    backToTop: string;
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
    controlsHelpAriaLabel: string;
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
    ctaViewAchievements: string;
    ctaRegister: string;
    registerTitle: string;
    registerHint: string;
    pausedGamesLink: string;
    hudVictoryLabel: string;
    failedCardsTitle: string;
    ctaPracticeWeakest: string;
    loadError: string;
    retryPlay: string;
  };
  errors: {
    completeFailed: string;
    recordFailed: string;
    pauseFailed: string;
    resumeFailed: string;
    startNewGame: string;
    retry: string;
  };
}

export interface StatsTranslations {
  title: string;
  subtitle: string;
  moduleListTitle: string;
  moduleListHint: string;
  attemptsLabel: string;
  studyCoverageLabel: string;
  accuracy: string;
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
    emptyPlayCta: string;
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

export interface AchievementItemTranslation {
  title: string;
  description: string;
  unlockHint: string;
  incentive: string;
}

export interface AchievementsTranslations {
  title: string;
  progress: string;
  motivation: {
    remaining: string;
    complete: string;
  };
  tooltip: {
    show: string;
    howToUnlock: string;
    unlocked: string;
    incentive: string;
  };
  categories: {
    game: string;
    streak: string;
    module: string;
    study: string;
  };
  items: Record<
    | 'first_game'
    | 'perfect_session_10'
    | 'cards_100'
    | 'weak_warrior'
    | 'games_10'
    | 'streak_7'
    | 'streak_30'
    | 'streak_100'
    | 'module_mastery_2'
    | 'module_mastery_3'
    | 'module_all_touched'
    | 'study_first'
    | 'study_sessions_10',
    AchievementItemTranslation
  >;
  toast: {
    unlocked: string;
  };
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
  scoreLabels: {
    streakSuffix: string;
    levelPrefix: string;
  };
  loading: string;
  error: string;
  retry: string;
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

export interface GameShellTranslations {
  back: string;
  login: string;
}

export interface SeoPageMeta {
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, nofollow';
}

export interface SeoTranslations {
  siteName: string;
  pages: {
    landing: SeoPageMeta;
    authLogin: SeoPageMeta;
    authRegister: SeoPageMeta;
    authCallback: SeoPageMeta;
    gameConfig: SeoPageMeta;
    gameSession: SeoPageMeta;
    studyConfig: SeoPageMeta;
    studySession: SeoPageMeta;
    home: SeoPageMeta;
    profile: SeoPageMeta;
    stats: SeoPageMeta;
    ranking: SeoPageMeta;
    backoffice: SeoPageMeta;
    notFound: SeoPageMeta;
  };
}

export interface CommonTranslations {
  dismiss: string;
  retry: string;
  loading: string;
  skipToContent: string;
  timeAgo: {
    justNow: string;
    seconds: string;
    minutes: string;
    hours: string;
  };
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
  notFound: {
    title: string;
    body: string;
    goHome: string;
    goApp: string;
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
  openMenu: string;
  logout: string;
}

export interface ProfileTranslations {
  title: string;
  subtitle: string;
  tabsAriaLabel: string;
  sections: {
    achievements: string;
    ranking: string;
    preferences: string;
  };
  hero: {
    visibleInRanking: string;
    hiddenInRanking: string;
  };
  account: {
    title: string;
    roleUser: string;
    roleTeacher: string;
    roleAdmin: string;
    roleGuest: string;
    userIdLabel: string;
  };
  preferences: {
    title: string;
    themeLabel: string;
    themeDescription: string;
    localeLabel: string;
    localeDescription: string;
  };
  ranking: {
    title: string;
    description: string;
    previewTitle: string;
    previewHidden: string;
    previewRankPlaceholder: string;
    nicknameHint: string;
    nicknameTooShort: string;
    viewRanking: string;
    discard: string;
    unsavedHint: string;
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
    guest: string;
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

export interface AuthTranslations {
  login: {
    subtitle: string;
    tab: string;
    submit: string;
    submitting: string;
  };
  register: {
    subtitle: string;
    tab: string;
    submit: string;
    submitting: string;
    nicknameHint: string;
  };
  fields: {
    email: string;
    password: string;
    nickname: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    passwordMinPlaceholder: string;
    nicknamePlaceholder: string;
    showPassword: string;
    hidePassword: string;
  };
  oauth: {
    divider: string;
    google: string;
    redirecting: string;
  };
  callback: {
    loading: string;
    redirectingToLogin: string;
    accessDenied: string;
    failed: string;
    generic: string;
  };
  errors: {
    unknown: string;
    invalidCredentials: string;
    conflict: string;
    validation: string;
    rateLimit: string;
    network: string;
    server: string;
    generic: string;
  };
  validation: {
    invalidEmail: string;
    passwordRequired: string;
    nicknameMin: string;
    nicknameMax: string;
    nicknamePattern: string;
    passwordMin: string;
  };
}

export interface BackofficeTranslations {
  shell: {
    refreshAriaLabel: string;
    loadError: string;
    retry: string;
  };
  period: Record<'24h' | '7d' | '15d' | '30d' | '6m' | 'all', string>;
  charts: {
    noActivityInPeriod: string;
    noDataInPeriod: string;
  };
  games: {
    title: string;
    subtitle: string;
    kpi: {
      totalGames: string;
      completedGames: string;
      completionRate: string;
      avgAccuracy: string;
      avgAccuracyHint: string;
      totalAttempts: string;
      attemptsPerGame: string;
      abandonedGames: string;
      totalPercent: string;
    };
    charts: {
      trendTitle: string;
      started: string;
      completed: string;
      noTrendData: string;
      modeDistributionTitle: string;
      topModulesTitle: string;
      qualityByModuleTitle: string;
      qualityByModuleHint: string;
      noModuleData: string;
      noModulePeriodData: string;
      gamesLegend: string;
      accuracyLegend: string;
    };
    modes: Record<string, string>;
  };
  users: {
    title: string;
    subtitle: string;
    snapshotAllTime: string;
    selectedPeriod: string;
    totalUsers: string;
    totalUsersInsight: string;
    neverPlayed: string;
    neverPlayedInsight: string;
    noRegisteredUsers: string;
    usersWithStreak: string;
    usersWithStreakInsight: string;
    averageLongestStreak: string;
    averageLongestStreakInsight: string;
    googleVsEmail: string;
    googleVsEmailInsight: string;
    newRegistrations: string;
    newRegistrationsInsight: string;
    activeUsers: string;
    activeUsersInsight: string;
    engagementRate: string;
    engagementRateInsight: string;
    engagementRateThresholdHint: string;
    charts: {
      registrationsByPeriod: string;
      newUsers: string;
      registrationChannel: string;
      google: string;
      email: string;
    };
  };
  observability: {
    title: string;
    subtitle: string;
    liveBadge: string;
    serverSincePrefix: string;
    serverScopeLabel: string;
    noHttpData: string;
    requestsByEndpoint: string;
    totalRequestsSuffix: string;
    noHttpRequestData: string;
    tabs: {
      http: string;
      runtime: string;
      visits: string;
      content: string;
    };
    httpSummary: {
      totalRequests: string;
      successRate: string;
      successRateHint: string;
      errorRate: string;
      errorRateHint: string;
      latencyP95: string;
      latencyDetail: string;
    };
    httpTable: {
      noData: string;
      endpoint: string;
      method: string;
      status: string;
      requests: string;
      previousPageAriaLabel: string;
      nextPageAriaLabel: string;
      endpointsRange: string;
    };
    visits: {
      loadError: string;
      totalVisits: string;
      totalVisitsInsight: string;
      uniqueVisitors: string;
      uniqueVisitorsInsight: string;
      conversion: string;
      conversionInsight: string;
      topPage: string;
      topPageInsight: string;
      visitsByPeriod: string;
      views: string;
      unique: string;
      topVisitedPages: string;
    };
    content: {
      loadError: string;
      totalFlashcards: string;
      totalFlashcardsInsight: string;
      createdInPeriod: string;
      createdInPeriodInsight: string;
      audioReady: string;
      audioReadyInsight: string;
      audioErrorInsight: string;
      audioSub: string;
      createdByPeriod: string;
      flashcardsSeriesLabel: string;
      byCategory: string;
    };
    runtime: {
      noHeapData: string;
      highMemoryHint: string;
      warningHeapHint: string;
      healthyMemoryHint: string;
      noEventLoopData: string;
      blockedEventLoopHint: string;
      warningEventLoopHint: string;
      healthyEventLoopHint: string;
      noUptimeData: string;
      stableServerHint: string;
      activeServerHint: string;
      recentServerHint: string;
      noGcData: string;
      highGcHint: string;
      normalGcHint: string;
      noRuntimeMetrics: string;
      heapUsed: string;
      eventLoopLagP95: string;
      uptime: string;
      gcTotal: string;
      activeHandles: string;
      activeHandlesHint: string;
      rssMemory: string;
      rssMemoryHint: string;
    };
  };
  flashcards: {
    title: string;
    subtitle: string;
    loadError: string;
    aiGenerate: string;
    bulkCreate: string;
    newFlashcard: string;
    pageOf: string;
    previous: string;
    next: string;
    createTitle: string;
    editTitle: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    cancel: string;
    delete: string;
    toolbar: {
      filterByCategory: string;
      allCategories: string;
      filterBySubcategory: string;
      allSubcategories: string;
      chooseCategoryFirst: string;
      filterByAudioStatus: string;
      allAudioStatuses: string;
      clearFilters: string;
      audioStatuses: Record<
        'pending' | 'generating' | 'ready' | 'failed',
        string
      >;
    };
    table: {
      empty: string;
      expression: string;
      category: string;
      subcategory: string;
      audio: string;
      view: string;
      edit: string;
      delete: string;
      audioStatuses: Record<
        'pending' | 'generating' | 'ready' | 'failed',
        string
      >;
    };
    form: {
      expression: string;
      meaning: string;
      category: string;
      subcategory: string;
      selectCategory: string;
      selectSubcategory: string;
      chooseCategoryFirst: string;
      examples: string;
      addExample: string;
      englishPlaceholder: string;
      spanishPlaceholder: string;
      saving: string;
      save: string;
      closeAriaLabel: string;
    };
    detail: {
      closeAriaLabel: string;
      pronunciation: string;
      pendingAudio: string;
      generatingAudio: string;
      failedAudio: string;
      american: string;
      british: string;
      australian: string;
      examplesAudio: string;
      examplesLabel: string;
      noGeneratedExamples: string;
      playAccentAriaLabel: string;
    };
    bulk: {
      title: string;
      subtitle: string;
      invalidJson: string;
      invalidArray: string;
      jsonArrayLabel: string;
      creating: string;
      create: string;
    };
    ai: {
      title: string;
      configureSubtitle: string;
      previewSubtitle: string;
      category: string;
      selectCategory: string;
      subcategory: string;
      selectSubcategory: string;
      chooseCategoryFirst: string;
      anchorExamples: string;
      count: string;
      extraInstructions: string;
      extraInstructionsPlaceholder: string;
      generateDrafts: string;
      generating: string;
      confirmDrafts: string;
      importing: string;
      examplesLabel: string;
    };
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
  auth: AuthTranslations;
  common: CommonTranslations;
  sidebar: SidebarTranslations;
  gameShell: GameShellTranslations;
  backoffice: BackofficeTranslations;
  seo: SeoTranslations;
}
