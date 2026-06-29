/**
 * Custom nav icons tied to the product identity (audio, phonetics, connected speech).
 * All icons use a 20×20 viewBox and inherit color via currentColor.
 */
import { type ReactElement } from 'react';

interface IconProps {
  className?: string;
}

const BASE = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 18,
  height: 18,
  viewBox: '0 0 20 20',
  'aria-hidden': true,
} as const;

const STROKE = {
  ...BASE,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Headphones — "Jugar". The game is about listening. */
export const HeadphonesIcon = ({ className }: IconProps): ReactElement => (
  <svg {...STROKE} className={className}>
    {/* Headband arc */}
    <path d="M4 11C4 7.134 6.686 4 10 4s6 3.134 6 7" />
    {/* Left ear cup */}
    <rect x="1.5" y="10.5" width="3" height="5" rx="1.5" />
    {/* Right ear cup */}
    <rect x="15.5" y="10.5" width="3" height="5" rx="1.5" />
  </svg>
);

/**
 * Waveform bars — "Estadísticas".
 * Symmetric amplitude shape: the visual language of audio.
 */
export const WaveformIcon = ({ className }: IconProps): ReactElement => (
  <svg {...BASE} fill="currentColor" className={className}>
    <rect x="1" y="14" width="2.5" height="4" rx="1.25" />
    <rect x="4.75" y="9" width="2.5" height="9" rx="1.25" />
    <rect x="8.75" y="5" width="2.5" height="13" rx="1.25" />
    <rect x="12.75" y="9" width="2.5" height="9" rx="1.25" />
    <rect x="16.5" y="14" width="2.5" height="4" rx="1.25" />
  </svg>
);

/** Trophy — "Ranking". */
export const TrophyIcon = ({ className }: IconProps): ReactElement => (
  <svg {...STROKE} className={className}>
    {/* Cup */}
    <path d="M6 2.5h8v7a4 4 0 0 1-8 0v-7z" />
    {/* Left handle */}
    <path d="M6 4.5H4a2 2 0 0 0 0 4h2" />
    {/* Right handle */}
    <path d="M14 4.5h2a2 2 0 0 0 0 4h-2" />
    {/* Stem */}
    <line x1="10" y1="13.5" x2="10" y2="16.5" />
    {/* Base */}
    <line x1="7" y1="16.5" x2="13" y2="16.5" />
  </svg>
);

/** Line chart — "Métricas de juegos". Analytics trend. */
export const ChartLineIcon = ({ className }: IconProps): ReactElement => (
  <svg {...STROKE} className={className}>
    {/* Axes */}
    <line x1="2" y1="17" x2="18" y2="17" />
    <line x1="2" y1="3" x2="2" y2="17" />
    {/* Trend line */}
    <polyline points="4,14 7,10 10,12 14,6 18,3" />
    {/* Dots */}
    <circle cx="4" cy="14" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="14" cy="6" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="18" cy="3" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

/** Stacked cards — "Flashcards". */
export const FlashcardIcon = ({ className }: IconProps): ReactElement => (
  <svg {...STROKE} className={className}>
    {/* Back card */}
    <rect x="5" y="3" width="12" height="9" rx="1.5" opacity="0.35" />
    {/* Front card */}
    <rect x="3" y="5.5" width="12" height="9" rx="1.5" />
    {/* Text lines on front card */}
    <line x1="6" y1="9.5" x2="12" y2="9.5" />
    <line x1="6" y1="12" x2="9.5" y2="12" />
  </svg>
);

/**
 * Pulse / ECG line — "Observabilidad".
 * Flat baseline with a sharp spike: monitoring signal.
 */
export const PulseIcon = ({ className }: IconProps): ReactElement => (
  <svg {...STROKE} className={className}>
    <polyline points="1,10 5,10 7,3.5 9,16.5 11,7 13,13 15,10 19,10" />
  </svg>
);

/** Two people — "Métricas de usuarios". */
export const UsersIcon = ({ className }: IconProps): ReactElement => (
  <svg {...STROKE} className={className}>
    {/* Front person */}
    <circle cx="8" cy="6" r="3" />
    <path d="M2 18c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    {/* Back person (offset) */}
    <circle cx="14.5" cy="5.5" r="2.5" opacity="0.5" />
    <path d="M14 12c1.5 0 3 .8 3.8 2" opacity="0.5" />
  </svg>
);
