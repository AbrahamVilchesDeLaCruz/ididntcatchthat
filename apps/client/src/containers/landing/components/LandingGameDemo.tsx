import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';

export const LandingGameDemo = (): ReactElement => {
  const { t } = useI18n();
  const gd = t.landing.gameDemo;

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            {gd.title}
          </h2>
          <p className="mx-auto max-w-[40ch] text-[var(--color-text-secondary)]">
            {gd.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {gd.cards.map((card) => (
            <div
              key={card.expression}
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
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm"
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

                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)] p-6 shadow-sm"
                >
                  <span className="text-xl font-bold text-[var(--color-brand-light)]">
                    {card.meaning}
                  </span>
                  <p className="text-center text-sm italic text-[var(--color-text-secondary)]">
                    &ldquo;{card.example}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
