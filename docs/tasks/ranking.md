# Tasks: Ranking — Bounded Context Ranking

**Spec**: [docs/spec/ranking.md](../spec/ranking.md)  
**Rama**: `feat/ranking_and_process_bc`

## Implementación inicial (cache + recomputo)

- [x] **TASK-RANKING-01** — Value Objects `RankingType`, `RankingPeriod`, `ModuleScope`
- [x] **TASK-RANKING-02** — Read model `RankingEntry` + repositorio
- [x] **TASK-RANKING-03** — `RankingRecomputer` + job programado *(obsoleto — reemplazado por proyección)*
- [x] **TASK-RANKING-04** — `RankingFinder` query
- [x] **TASK-RANKING-05** — Handler dirty on mastery *(obsoleto)*
- [x] **TASK-RANKING-06** — Migración + entidades TypeORM *(cache legacy)*
- [x] **TASK-RANKING-07** — `GET /rankings` controller + `RankingModule`
- [x] **TASK-RANKING-08** — E2E rankings flow

## Proyección incremental (write-time)

- [x] **TASK-RANKING-09** — Tabla `ranking_user_scores` + migración que elimina `rankings_cache` / `ranking_metadata`
- [x] **TASK-RANKING-10** — `RankingRepository` + `RankingUpdater` + aggregate `Ranking`
- [x] **TASK-RANKING-11** — Handlers: `GameCompleted`, `AttemptRecorded`, `StreakUpdated`, `ModuleMasteryLevelIncreased`
- [x] **TASK-RANKING-12** — `syncProfile` en `PATCH /users/me/ranking-profile` (backfill / delete)
- [x] **TASK-RANKING-13** — `RankingFinder` lee proyección sin recomputo
- [x] **TASK-RANKING-14** — Eliminar `RankingRecomputer`, cron y handlers `markDirty`
- [x] **TASK-RANKING-15** — Actualizar documentación
- [x] **TASK-RANKING-16** — Alinear convenciones DDD: aggregate, repository estándar, `RankingSelector`, puertos separados
