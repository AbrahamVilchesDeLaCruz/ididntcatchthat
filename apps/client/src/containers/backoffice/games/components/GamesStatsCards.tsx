import { type ReactElement } from 'react';
import { Card, CardContent } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import type { GamesStatsVM } from '../backoffice-games.types';

interface GamesStatsCardsProps {
  stats: GamesStatsVM;
}

export const GamesStatsCards = ({
  stats,
}: GamesStatsCardsProps): ReactElement => {
  const cards = [
    {
      label: 'Partidas totales',
      value: stats.totalGames.toLocaleString('es-ES'),
      badge: 'total',
    },
    {
      label: 'Partidas completadas',
      value: stats.completedGames.toLocaleString('es-ES'),
      badge: 'completadas',
    },
    {
      label: 'Precisión media',
      value: `${stats.avgAccuracy.toFixed(1)}%`,
      badge: 'accuracy',
    },
    {
      label: 'Total intentos',
      value: stats.totalAttempts.toLocaleString('es-ES'),
      badge: 'intentos',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.badge}
          className="bg-[var(--color-bg-card)] border-[var(--color-border)]"
        >
          <CardContent className="p-5">
            <p className="text-[var(--color-text-secondary)] text-sm mb-2">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {card.value}
            </p>
            <Badge
              variant="secondary"
              className="mt-2 text-xs bg-white/10 text-[var(--color-text-secondary)]"
            >
              {card.badge}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
