import { type Translations } from '@/core/i18n/i18n.types';

export const en: Translations = {
  landing: {
    hero: {
      badge: 'Coming soon',
      headline: 'That moment when a native speaks…',
      headlineAccent: 'and you get nothing.',
      subheadline:
        'The app that teaches you how natives actually speak — real phonetics, connected speech, and 3 accents per expression.',
      ctaPrimary: "Notify me when it's ready",
      ctaSecondary: 'See how it works',
      ctaPlay: 'Play now',
      ctaHowItWorks: 'See how it works',
      navBackoffice: 'Go to backoffice →',
      navLogin: 'Log in',
      navRegister: 'Sign up',
    },
    authGate: {
      title: 'How do you want to play?',
      subtitle: 'Log in to save your progress or play directly as a guest',
      login: 'Log in',
      register: 'Sign up for free',
      divider: 'or',
      guest: 'Play as guest →',
      close: 'Close',
    },
    gameDemo: {
      title: 'See it in action',
      subtitle: 'Learn real pronunciation with interactive flashcards',
      hoverHint: 'Hover to reveal →',
    },
    problem: {
      sectionLabel: 'The problem',
      headline: "You passed B2. You still don't understand natives.",
      subheadline:
        "That's not your fault — it's what you were taught. Schools focus on grammar. Natives speak phonetics.",
      duolingoLabel: 'What Duolingo teaches',
      duolingoDescription:
        "Vocabulary. Grammar. Textbook phrases you'll never hear in real life.",
      weTeachLabel: 'What we teach',
      weTeachDescription:
        'How sounds change when words connect. The 23 real phonemes. Expressions natives actually use.',
      exampleLabel: 'Connected speech — example',
      exampleWritten: '"Red and green"',
      exampleNative: '"reh\u0072an green"',
      exampleTag: 'Flap T',
    },
    howItWorks: {
      sectionLabel: 'How it works',
      headline: 'Simple loop. Real progress.',
      subheadline:
        'The same flow for every flashcard. Easy to pick up, hard to put down.',
      steps: [
        {
          number: '01',
          title: 'See the expression',
          description:
            'A flashcard shows a word, phoneme, or native expression. You think: do I know this?',
        },
        {
          number: '02',
          title: 'Judge yourself',
          description:
            "No trick questions. You decide: ✓ I knew it, or ✗ I didn't. Honest self-assessment like Anki.",
        },
        {
          number: '03',
          title: 'Hear it in 3 accents',
          description:
            'Listen to native voices — American, British, Australian — with studio-quality synthesis.',
        },
        {
          number: '04',
          title: 'Try to pronounce it',
          description:
            'Optional: record yourself. Get scored. Earn bonus points for sounding like a native.',
        },
      ],
    },
    modules: {
      sectionLabel: 'Modules',
      headline: 'Four areas. One goal.',
      subheadline:
        'Curated content — not AI-generated. Every expression hand-picked to fill the gaps in your English.',
      items: [
        {
          title: 'Native Sounds',
          tag: 'Phonetics',
          description:
            'Master the 23 phonemes of English. Focus on the ones that trip up Spanish speakers most.',
        },
        {
          title: 'Connecting Words',
          tag: 'Connected Speech',
          description:
            'Hear how sounds morph and merge when natives speak at full speed.',
        },
        {
          title: 'Beautifying Sentences',
          tag: 'Fluency',
          description:
            'Connectors and structures that make you sound fluent, not robotic.',
        },
        {
          title: 'Sounding Native',
          tag: 'Expressions',
          description:
            'The casual vocabulary natives use every day — never taught in class.',
        },
      ],
    },
    notify: {
      sectionLabel: 'Coming soon',
      headline: 'Stop missing what natives say.',
      subheadline:
        "Be the first to know when we launch. No spam — one email, when it's ready.",
      inputPlaceholder: 'your@email.com',
      ctaButton: 'Notify me',
      disclaimer: 'No spam. Unsubscribe any time.',
    },
    footer: {
      tagline: 'Still in development',
    },
  },
  game: {
    config: {
      title: 'Set up your game',
      subtitle: 'Choose a module and how many cards you want to practice.',
      moduleLabel: 'Module',
      countLabel: 'Cards',
      ctaStart: 'Start game',
      modules: {
        random: 'Random mix',
        native_sounds: 'Native Sounds',
        connecting_words: 'Connecting Words',
        beautifying_sentences: 'Beautifying Sentences',
        sounding_native: 'Sounding Native',
      },
    },
    play: {
      cardOf: 'of',
      correct: 'I knew it',
      incorrect: "I didn't know",
      hoverToReveal: 'Hover to reveal',
      tapToReveal: 'Tap to reveal',
      tapToFlipBack: 'Tap to flip back',
    },
    summary: {
      title: 'Game over!',
      subtitleGood: 'Great session! 🎉',
      subtitleKeepGoing: "Keep practicing, you'll get there!",
      accuracy: 'Accuracy',
      correct: 'Correct',
      total: 'Total',
      duration: 'Duration',
      ctaPlayAgain: 'Play again',
      ctaRegister: 'Save my progress',
      registerTitle: 'Want to save your progress?',
      registerHint:
        "You played as a guest — your streak won't be saved. Sign up, it's free!",
    },
  },
};
