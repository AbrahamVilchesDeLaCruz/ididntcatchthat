# Find Rankings — Casos de uso

## `RankingSearcher`

| Input | Output |
| ----- | ------ |
| `userId`, `type`, `period`, `module?`, `limit?` | `{ entries: RankingEntryResponse[], currentUser: RankingEntryPrimitives \| null, viewer: RankingViewerResponse }` |

`RankingEntryResponse` extiende `RankingEntryPrimitives` con `isMe: boolean`.

### Reglas

| Regla | Detalle |
| ----- | ------- |
| Lectura directa | `RankingLeaderboardQuery` sobre `ranking_user_scores` con `RANK()` — sin recomputo |
| `limit` | `clamp(limit ?? 10, 1, 50)` |
| `period` efectivo | `best_streak` / `module_master` se resuelven a `all_time` aunque el query pida otro |
| `module` efectivo | `module_master` requiere `module`; el resto colapsa a `'global'` |
| `isMe` | Marcado en cada entry (`entry.userId === userId`) |
| Posición fuera del top N | `currentUser` resuelto con `RankingLeaderboardQuery.selectUserEntry` (puede ser `null`) |
| Viewer | `RankingViewerProjector.project(preferences, currentUser)` — emite `status` (`hidden` / `visible_unranked` / `ranked`) según opt-in y score |

## `RankingViewerProjector`

Tipo de entrada: `RankingProfileQuery.findUserRankingPreferences` + `currentUser`. Tipo de salida: `RankingViewerResponse` con `showInRanking`, `nickname`, `rank`, `score`, `status`.
