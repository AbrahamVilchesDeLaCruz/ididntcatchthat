# Progress UX v2

**Estado**: Implementado  
**Rama**: `feat/progress-ux-v2`  
**Fuera de scope**: rediseño del toolbar de partida

## Objetivos

- Hero KPI en `/stats` con métricas accionables (`GET /progress/summary`)
- Galería de logros movida a `/profile#achievements` — ver [achievements.md](achievements.md)
- Partida de débiles vía `POST /games { source: 'weakest' }`
- Panel guest local (Zustand) + migración al registrarse
- Puente post-partida con fallos de sesión y CTA débiles

## API

### GET /progress/summary

Autenticado. Devuelve:

| Campo | Fuente |
|-------|--------|
| `currentStreak`, `longestStreak` | `users` |
| `accuracy7d` | `user_flashcard_stats` últimos 7 días |
| `totalAttempts` | SUM attempts |
| `weakCount` | cartas con `error_count > 0` |
| `masteredCount` | `times_played >= 5` y `accuracy_rate >= 0.85` |
| `gamesCompleted` | `games` completados |
| `lastPlayedAt` | MAX `last_seen_at` |

### POST /games — `source=weakest`

- Solo usuarios autenticados (guest → 403)
- Resuelve IDs con `WeakestFlashcardQuery` (Progress BC)
- Si no hay débiles → 422 `InsufficientWeakFlashcards`
- Si hay menos que `cardCount`, usa las disponibles

## Cliente

1. **StatsHero** — fila 4 KPIs (2×2 mobile)
2. **GuestStatsPanel** — Zustand persist `guest-stats`
3. **CTA débiles** — stats + GameSummary
4. **Invalidación** — `summary`, `statsKeys.all` tras complete

Logros: ver [achievements.md](achievements.md) (profile pod, no stats).
