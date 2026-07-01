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

        <div className="flex flex-wrap items-stretch justify-center gap-6">
          {gd.cards.map((card) => (
            <div
              key={card.expression}
              className="demo-card-wrapper w-full max-w-[320px]"
              style={{ height: '360px', perspective: '1200px' }}
            >
              <div
                className="demo-card-inner size-full"
                style={{
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {/* Front — like game play (expression + IPA + hint) */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center shadow-sm"
                >
                  <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                    {card.expression}
                  </span>
                  <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1 font-mono text-sm text-[var(--color-brand-light)]">
                    {card.ipa}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {gd.hoverHint}
                  </span>
                </div>

                {/* Back — like game reveal (meaning + bilingual examples) */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)] p-6 text-center shadow-sm"
                >
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {card.expression}
                  </p>
                  <p className="text-lg font-semibold text-[var(--color-brand-light)]">
                    {card.meaning}
                  </p>
                  <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1 font-mono text-sm text-[var(--color-brand-light)]">
                    {card.ipa}
                  </span>
                  <div className="w-full max-w-[260px] space-y-2">
                    <p className="text-[15px] italic text-[var(--color-text-primary)]">
                      &ldquo;{card.exampleEn}&rdquo;
                    </p>
                    <p className="text-[13px] text-[var(--color-text-muted)]">
                      {card.exampleEs}
                    </p>
                  </div>
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
