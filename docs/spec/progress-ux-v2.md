# Progress UX v2

**Estado**: Implementado  
**Rama**: `feat/progress-ux-v2`  
**Fuera de scope**: rediseño del toolbar de partida

## Objetivos

- Hero KPI en `/stats` con métricas accionables (`GET /progress/summary`)
- Galería de logros (`GET /achievements`, BC Achievement)
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

### GET /achievements

- Catálogo fijo v1 (8 logros)
- Query opcional `since` (ISO8601) para desbloqueos recientes

## Cliente

1. **StatsHero** — fila 4 KPIs (2×2 mobile)
2. **StatsAchievements** — galería locked/unlocked
3. **GuestStatsPanel** — Zustand persist `guest-stats`
4. **CTA débiles** — stats + GameSummary
5. **Invalidación** — `summary`, `achievements`, `statsKeys.all` tras complete

## Logros v1

| Key | Trigger |
|-----|---------|
| `first_game` | primera partida completada |
| `streak_7` / `streak_30` | `StreakUpdated` |
| `module_mastery_2` / `module_mastery_3` | `ModuleMasteryLevelIncreased` |
| `perfect_session_10` | 100% y ≥10 cartas |
| `cards_100` | ≥100 intentos totales |
| `weak_warrior` | completar partida `source=weakest` |
