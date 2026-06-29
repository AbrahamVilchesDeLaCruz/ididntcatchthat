import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { HomeActionCardVM } from '../home.types';

interface HomeActionGridProps {
  title: string;
  cards: HomeActionCardVM[];
}

export const HomeActionGrid = ({
  title,
  cards,
}: HomeActionGridProps): ReactElement => (
  <section>
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
      {title}
    </h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.id}
          to={card.to}
          className="group flex items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-colors hover:border-[var(--color-brand)]"
        >
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-text-primary)]">
              {card.title}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {card.description}
            </p>
          </div>
          <ChevronRight
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-brand)]"
            aria-hidden
          />
        </Link>
      ))}
    </div>
  </section>
);
