import { type ReactElement } from 'react';
import { Link2, MessageCircle, Sparkles, Volume2 } from 'lucide-react';
import { useI18n } from '@/core/i18n';

const modulesMeta = [
  {
    Icon: Volume2,
    color: 'var(--color-brand)',
    colorDim: 'var(--color-brand-dim)',
  },
  {
    Icon: Link2,
    color: 'var(--color-brand-light)',
    colorDim: 'var(--color-brand-dim)',
  },
  {
    Icon: Sparkles,
    color: 'var(--color-accent-green)',
    colorDim: 'var(--color-accent-green-dim)',
  },
  {
    Icon: MessageCircle,
    color: 'var(--color-accent-green)',
    colorDim: 'var(--color-accent-green-dim)',
  },
] as const;

export const LandingModules = (): ReactElement => {
  const { t } = useI18n();
  const m = t.landing.modules;

  return (
    <section className="border-t border-[var(--color-border)] px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">
          {m.sectionLabel}
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          {m.headline}
        </h2>
        <p className="mb-12 text-center text-[var(--color-text-secondary)]">
          {m.subheadline}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {m.items.map((item, i) => {
            const meta = modulesMeta[i];
            const { Icon } = meta;
            return (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-colors hover:border-[var(--color-border-strong)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ background: meta.colorDim, color: meta.color }}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: meta.colorDim, color: meta.color }}
                  >
                    {item.tag}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.examples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-muted)]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
