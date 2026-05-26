import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

interface DemoCard {
  id: string;
  expression: string;
  ipa: string;
  meaning: string;
  example: string;
}

const DEMO_CARDS: DemoCard[] = [
  {
    id: 'demo-1',
    expression: 'gonna',
    ipa: '/ˈɡɒnə/',
    meaning: 'Going to',
    example: "I'm gonna be late.",
  },
  {
    id: 'demo-2',
    expression: 'wanna',
    ipa: '/ˈwɒnə/',
    meaning: 'Want to',
    example: 'Do you wanna grab coffee?',
  },
];

export const LandingGameDemo = (): ReactElement => {
  const { t } = useI18n();
  const gd = t.landing.gameDemo;

  return (
    <section className="relative px-5 py-20">
      {/* Section header */}
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          {gd.title}
        </h2>
        <p className="mx-auto max-w-[40ch] text-[var(--color-text-secondary)]">
          {gd.subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {DEMO_CARDS.map((card) => (
          <div
            key={card.id}
            className="demo-card-wrapper"
            style={{ width: '280px', height: '180px', perspective: '1000px' }}
          >
            <div
              className="demo-card-inner"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Front */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
              >
                <span className="text-3xl font-bold text-[var(--color-text-primary)]">
                  {card.expression}
                </span>
                <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1 font-mono text-sm text-[var(--color-brand-light)]">
                  {card.ipa}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {gd.hoverHint}
                </span>
              </div>

              {/* Back */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)] p-6"
              >
                <span className="text-xl font-bold text-[var(--color-brand-light)]">
                  {card.meaning}
                </span>
                <p className="text-center text-sm italic text-[var(--color-text-secondary)]">
                  "{card.example}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline styles for hover flip */}
      <style>{`
        .demo-card-wrapper:hover .demo-card-inner {
          transform: rotateY(180deg);
        }
        .demo-card-wrapper:hover > .demo-card-inner > div:first-child {
          border-color: var(--color-brand);
        }
      `}</style>
    </section>
  );
};
