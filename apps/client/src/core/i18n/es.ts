import { type Translations } from '@/core/i18n/i18n.types';

export const es: Translations = {
  landing: {
    hero: {
      badge: 'Próximamente',
      headline: 'Ese momento en el que un nativo habla…',
      headlineAccent: 'y no entiendes nada.',
      subheadline:
        'La app que te enseña cómo hablan realmente los nativos — fonética real, connected speech y 3 acentos por expresión.',
      ctaPrimary: 'Avísame cuando esté lista',
      ctaSecondary: 'Cómo funciona',
      ctaPlay: 'Jugar ahora',
      ctaHowItWorks: 'Ver cómo funciona',
      navBackoffice: 'Ir al backoffice →',
      navStats: 'Mis estadísticas →',
      navDashboard: 'Dashboard →',
      navLogin: 'Iniciar sesión',
      navRegister: 'Registrarse',
    },
    authGate: {
      title: '¿Cómo querés jugar?',
      subtitle:
        'Accedé para guardar tu progreso o jugá directamente como invitado',
      login: 'Iniciar sesión',
      register: 'Crear cuenta gratis',
      divider: 'o',
      guest: 'Jugar como invitado →',
      close: 'Cerrar',
    },
    gameDemo: {
      title: 'Así funciona',
      subtitle: 'Aprendé pronunciación real con flashcards interactivas',
      hoverHint: 'Hover para ver →',
    },
    problem: {
      sectionLabel: 'El problema',
      headline: 'Tienes un B2. Y sigues sin entender a los nativos.',
      subheadline:
        'No es tu culpa — es lo que te enseñaron. Las escuelas se centran en gramática. Los nativos hablan en fonética.',
      duolingoLabel: 'Lo que enseña Duolingo',
      duolingoDescription:
        'Vocabulario. Gramática. Frases de libro que nunca escucharás en la vida real.',
      weTeachLabel: 'Lo que enseñamos nosotros',
      weTeachDescription:
        'Cómo cambian los sonidos al conectar palabras. Los 23 fonemas reales del inglés. Expresiones que usan los nativos de verdad.',
      exampleLabel: 'Connected speech — ejemplo',
      exampleWritten: '"Red and green"',
      exampleNative: '"reh\u0072an green"',
      exampleTag: 'T suave',
    },
    howItWorks: {
      sectionLabel: 'Cómo funciona',
      headline: 'Un bucle simple. Progreso real.',
      subheadline:
        'El mismo flujo para cada flashcard. Fácil de empezar, difícil de parar.',
      steps: [
        {
          number: '01',
          title: 'Ve la expresión',
          description:
            'Una flashcard muestra una palabra, fonema o expresión nativa. Tú piensas: ¿la conozco?',
        },
        {
          number: '02',
          title: 'Júzgate tú mismo',
          description:
            'Sin trampas. Decides tú: ✓ la sabía, o ✗ no la sabía. Autoevaluación honesta como Anki.',
        },
        {
          number: '03',
          title: 'Escúchala en 3 acentos',
          description:
            'Voces nativas — americano, británico, australiano — con síntesis de voz de estudio.',
        },
        {
          number: '04',
          title: 'Intenta pronunciarla',
          description:
            'Opcional: grábate. Recibe una puntuación. Gana puntos extra por sonar como un nativo.',
        },
      ],
    },
    modules: {
      sectionLabel: 'Módulos',
      headline: 'Cuatro áreas. Un objetivo.',
      subheadline:
        'Contenido curado — no generado por IA. Cada expresión seleccionada a mano para cubrir los huecos de tu inglés.',
      items: [
        {
          title: 'Sonidos nativos',
          tag: 'Fonética',
          description:
            'Domina los 23 fonemas del inglés. Foco en los que más cuestan a los hispanohablantes.',
        },
        {
          title: 'Habla conectada',
          tag: 'Enlace y reducción',
          description:
            'Escucha cómo cambian y fusionan los sonidos a velocidad real — gonna, enlace, elisión.',
        },
        {
          title: 'Fluidez y conectores',
          tag: 'Fluidez',
          description:
            'Conectores y estructuras para sonar fluido, no robótico.',
        },
        {
          title: 'Inglés de calle',
          tag: 'Inglés cotidiano',
          description:
            'El vocabulario informal que usan los nativos cada día — y que nunca te enseñaron en clase.',
        },
      ],
    },
    notify: {
      sectionLabel: 'Próximamente',
      headline: 'Deja de perderte lo que dicen los nativos.',
      subheadline:
        'Sé el primero en saber cuándo lanzamos. Sin spam — un email, cuando esté lista.',
      inputPlaceholder: 'tu@email.com',
      ctaButton: 'Avísame',
      disclaimer: 'Sin spam. Cancela cuando quieras.',
    },
    footer: {
      tagline: 'En desarrollo',
    },
  },
  game: {
    config: {
      title: 'Configurá tu partida',
      subtitle: 'Elegí un módulo y cuántas cartas querés practicar.',
      moduleLabel: 'Módulo',
      subcategoryLabel: 'Alcance',
      wholeCategory: 'Toda la categoría',
      countLabel: 'Cartas',
      ctaStart: 'Empezar partida',
      guestError: 'No pudimos iniciar la partida de invitado.',
      guestRetry: 'Reintentar',
      pausedSaved: 'Partida guardada. Podés retomarla cuando quieras.',
      modules: {
        random: 'Mezcla aleatoria',
        native_sounds: 'Sonidos nativos',
        connected_speech: 'Habla conectada',
        flow_connectors: 'Fluidez y conectores',
        real_talk: 'Inglés de calle',
      },
    },
    paused: {
      title: 'Partidas en curso',
      cards: 'cartas',
      continue: 'Continuar',
      abandon: 'Abandonar',
      abandonConfirm: '¿Abandonar esta partida?',
      cancel: 'Cancelar',
      randomModule: 'Aleatorio',
      maxModalTitle: 'Límite de partidas pausadas',
      maxModalBody:
        'Tenés 5 partidas pausadas. Abandoná una para empezar una nueva.',
      abandonOldest: 'Abandonar la más antigua',
      chooseToAbandon: 'Elegir cuál abandonar',
    },
    play: {
      cardOf: 'de',
      correct: 'Lo sabía',
      incorrect: 'No lo sabía',
      hoverToReveal: 'Hover para revelar',
      tapToReveal: 'Tocá para revelar',
      tapToFlipBack: 'Tocá para volver',
      pause: 'Pausar',
      listenExample: 'Escuchar ejemplo',
      listenNative: 'Escuchar nativo',
      micSoon: 'Próximamente',
      pausedToast: 'Partida guardada',
    },
    summary: {
      title: '¡Partida terminada!',
      subtitleGood: '¡Buena sesión! 🎉',
      subtitleKeepGoing: '¡Seguí practicando, vas a llegar!',
      accuracy: 'Precisión',
      correct: 'Correctas',
      total: 'Total',
      duration: 'Duración',
      ctaPlayAgain: 'Jugar de nuevo',
      ctaChooseModule: 'Elegir otro módulo',
      ctaViewStats: 'Ver mis estadísticas →',
      ctaRegister: 'Guardar mi progreso',
      registerTitle: '¿Querés guardar tu progreso?',
      registerHint:
        'Jugaste como invitado — tu racha no se guarda. ¡Registrate, es gratis!',
      pausedGamesLink: 'Tenés {count} partidas pausadas — continuar',
    },
  },
  stats: {
    title: 'Mi progreso',
    subtitle: 'Resumen de tu avance por módulo',
    moduleChartTitle: 'Precisión por módulo',
    moduleChartHint: 'Tocá un módulo para ver subcategorías',
    weakTableTitle: 'Flashcards más difíciles',
    noModuleData: 'Sin datos de módulos aún',
    noWeakData: 'Sin datos de flashcards difíciles',
    noWeakInModule: '¡Ningún error en este módulo!',
    noSubcategoryData: 'Sin datos de subcategorías para este módulo',
    emptyGlobalTitle: 'Todavía no hay progreso',
    emptyGlobalBody: 'Jugá tu primera partida para ver estadísticas aquí.',
    emptyGlobalCta: 'Jugar primera partida',
    retry: 'Reintentar',
    loadError: 'Error al cargar el progreso.',
    backToModules: '← Volver al resumen',
    subcategoryTitleSuffix: '— subcategorías',
    practice: 'Practicar',
    table: {
      expression: 'Expresión',
      module: 'Módulo',
      errors: 'Errores',
      lastAttempt: 'Último intento',
    },
    mastery: {
      novice: 'Novato',
      progressing: 'En progreso',
      solid: 'Sólido',
      mastered: 'Dominado',
    },
  },
  ranking: {
    title: 'Ranking',
    subtitle: 'Compite con otros jugadores y controla tu visibilidad pública',
    profile: {
      title: 'Tu perfil en el ranking',
      showNickname: 'Mostrar mi nickname en los rankings',
      nicknamePlaceholder: 'Nickname público',
      save: 'Guardar preferencias',
      saving: 'Guardando...',
      saved: 'Preferencias guardadas',
      saveError: 'No se pudieron guardar las preferencias',
    },
    filters: {
      type: 'Tipo de ranking',
      period: 'Período',
      module: 'Módulo',
    },
    types: {
      most_active: 'Más activos',
      most_accurate: 'Más precisos',
      top_scorer: 'Top scorers',
      best_streak: 'Mejor racha',
      module_master: 'Maestros del módulo',
    },
    periods: {
      weekly: 'Semanal',
      monthly: 'Mensual',
      all_time: 'Histórico',
    },
    table: {
      rank: '#',
      player: 'Jugador',
      score: 'Puntuación',
      you: 'Tú',
    },
    scoreUnits: {
      most_active: 'partidas',
      most_accurate: 'precisión',
      top_scorer: 'aciertos',
      best_streak: 'días',
      module_master: 'nivel',
    },
    loading: 'Cargando ranking...',
    error: 'Error al cargar el ranking. Intentalo de nuevo.',
    empty: 'Todavía no hay jugadores en este ranking.',
    emptyOptInHint:
      'Activa "Mostrar mi nickname" y pulsa Guardar preferencias.',
    emptyMostActiveHint:
      'Cuentan partidas en modo Juego completadas (no Estudio).',
    outsideTopHint:
      'Estás en el ranking pero fuera del top 10. Tu posición aparece abajo.',
    yourPosition: 'Tu posición',
    periodIgnoredHint:
      'Este ranking no usa filtro de período — muestra datos históricos.',
  },
};
