import { type ReactElement, useState } from 'react';
import { useI18n } from '@/core/i18n';

export const LandingGameDemo = (): ReactElement => {
  const { t } = useI18n();
  const gd = t.landing.gameDemo;
  const [flippedExpression, setFlippedExpression] = useState<string | null>(
    null,
  );

  const toggleFlip = (expression: string): void => {
    setFlippedExpression((current) =>
      current === expression ? null : expression,
    );
  };

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 px-4 py-14 sm:px-5 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            {gd.title}
          </h2>
          <p className="mx-auto max-w-[40ch] text-sm text-[var(--color-text-secondary)] sm:text-base">
            {gd.subtitle}
          </p>
        </div>

        <div className="mx-auto flex max-w-[280px] flex-col gap-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-6">
          {gd.cards.map((card) => {
            const isFlipped = flippedExpression === card.expression;

            return (
              <button
                key={card.expression}
                type="button"
                aria-pressed={isFlipped}
                aria-label={`${card.expression}, ${isFlipped ? gd.tapHint : gd.hoverHint}`}
                data-flipped={isFlipped ? 'true' : 'false'}
                onClick={() => toggleFlip(card.expression)}
                className="demo-card-wrapper group h-[300px] w-full touch-manipulation select-none sm:h-[360px] sm:max-w-[320px]"
                style={{ perspective: '1200px' }}
              >
                <div
                  className="demo-card-inner size-full"
                  style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-center shadow-sm sm:gap-4 sm:p-6"
                  >
                    <span className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
                      {card.expression}
                    </span>
                    <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1 font-mono text-xs text-[var(--color-brand-light)] sm:text-sm">
                      {card.ipa}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] sm:text-sm">
                      <span className="sm:hidden">{gd.tapHint}</span>
                      <span className="hidden sm:inline">{gd.hoverHint}</span>
                    </span>
                  </div>

                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)] p-4 text-center shadow-sm sm:gap-4 sm:p-6"
                  >
                    <p className="text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
                      {card.expression}
                    </p>
                    <p className="text-base font-semibold leading-snug text-[var(--color-brand-light)] sm:text-lg">
                      {card.meaning}
                    </p>
                    <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-brand-light)] sm:px-3 sm:py-1 sm:text-sm">
                      {card.ipa}
                    </span>
                    <div className="w-full space-y-1.5 sm:space-y-2">
                      <p className="text-sm italic leading-snug text-[var(--color-text-primary)] sm:text-[15px]">
                        &ldquo;{card.exampleEn}&rdquo;
                      </p>
                      <p className="text-xs leading-snug text-[var(--color-text-muted)] sm:text-[13px]">
                        {card.exampleEs}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .demo-card-wrapper[data-flipped='true'] .demo-card-inner {
          transform: rotateY(180deg);
        }
        .demo-card-wrapper[data-flipped='true'] > .demo-card-inner > div:first-child {
          border-color: var(--color-brand);
        }
        @media (hover: hover) and (pointer: fine) {
          .demo-card-wrapper:hover .demo-card-inner {
            transform: rotateY(180deg);
          }
          .demo-card-wrapper:hover > .demo-card-inner > div:first-child {
            border-color: var(--color-brand);
          }
        }
      `}</style>
    </section>
  );
};
