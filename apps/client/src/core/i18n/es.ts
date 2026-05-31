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
      exampleTag: 'Flap T',
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
          title: 'Conectando palabras',
          tag: 'Connected Speech',
          description:
            'Escucha cómo los sonidos se transforman y fusionan cuando los nativos hablan a velocidad real.',
        },
        {
          title: 'Mejorando frases',
          tag: 'Fluidez',
          description:
            'Conectores y estructuras para sonar fluido, no robótico.',
        },
        {
          title: 'Sonando nativo',
          tag: 'Expresiones',
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
      countLabel: 'Cartas',
      ctaStart: 'Empezar partida',
      modules: {
        random: 'Mezcla aleatoria',
        native_sounds: 'Sonidos nativos',
        connecting_words: 'Conectando palabras',
        beautifying_sentences: 'Mejorando frases',
        sounding_native: 'Sonando nativo',
      },
    },
    play: {
      cardOf: 'de',
      correct: 'Lo sabía',
      incorrect: 'No lo sabía',
      hoverToReveal: 'Hover para revelar',
      tapToReveal: 'Tocá para revelar',
      tapToFlipBack: 'Tocá para volver',
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
      ctaViewStats: 'Ver mis estadísticas →',
      ctaRegister: 'Guardar mi progreso',
      registerTitle: '¿Querés guardar tu progreso?',
      registerHint:
        'Jugaste como invitado — tu racha no se guarda. ¡Registrate, es gratis!',
    },
  },
};
