# Tasks: Ranking UX overhaul

**Spec API**: [docs/spec/ranking.md](../spec/ranking.md)  
**Spec Client**: [docs/spec/ranking-client.md](../spec/ranking-client.md)  
**Rama**: `feat/ranking-ux`

## API

- [x] **TASK-RANKING-UX-01** — `isMe` en cada entry de `GET /rankings`
- [x] **TASK-RANKING-UX-02** — Bloque `viewer` con `status`: `hidden` \| `visible_unranked` \| `ranked`
- [x] **TASK-RANKING-UX-03** — Tests unit + e2e viewer states

## Cliente

- [x] **TASK-RANKING-UX-04** — shadcn avatar, dialog, switch + DiceBear util
- [x] **TASK-RANKING-UX-05** — `UserProfileMenu` en sidebar (nickname + opt-in)
- [x] **TASK-RANKING-UX-06** — `RankingPodium` + Lucide icons (sin emojis)
- [x] **TASK-RANKING-UX-07** — Quitar `RankingProfileCard` de ranking page; banners viewer
- [x] **TASK-RANKING-UX-08** — i18n + tests RTL

## CI

- [x] **TASK-RANKING-UX-09** — `pnpm test:ci` green + PR a `dev`
