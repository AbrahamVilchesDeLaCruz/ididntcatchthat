# Find Rankings — Casos de uso

## `RankingSearcher`

| Input | Output |
| ----- | ------ |
| `userId`, `type`, `period`, `module?`, `limit?` | `{ entries, currentUser, viewer }` |

### Reglas

| Regla | Detalle |
| ----- | ------- |
| Lectura directa | `RankingLeaderboardQuery` sobre `ranking_user_scores` — sin recomputo |
| `isMe` | Marcado en cada entry comparando `userId` |
| Posición fuera del top N | `currentUser` resuelto con `RankingLeaderboardQuery.selectUserEntry` |
| Viewer | `RankingViewerProjector` según opt-in y score |
