# Tasks: Ranking UX overhaul

**Spec API**: [docs/spec/ranking.md](../spec/ranking.md)  
**Spec Client**: [docs/spec/ranking-client.md](../spec/ranking-client.md)  
**Rama**: `feat/ranking-ux`

## API

- [ ] **TASK-RANKING-UX-01** — `isMe` en cada entry de `GET /rankings`
- [ ] **TASK-RANKING-UX-02** — Bloque `viewer` con `status`: `hidden` \| `visible_unranked` \| `ranked`
- [ ] **TASK-RANKING-UX-03** — Tests unit + e2e viewer states

## Cliente

- [ ] **TASK-RANKING-UX-04** — shadcn avatar, dialog, switch + DiceBear util
- [ ] **TASK-RANKING-UX-05** — `UserProfileMenu` en sidebar (nickname + opt-in)
- [ ] **TASK-RANKING-UX-06** — `RankingPodium` + Lucide icons (sin emojis)
- [ ] **TASK-RANKING-UX-07** — Quitar `RankingProfileCard` de ranking page; banners viewer
- [ ] **TASK-RANKING-UX-08** — i18n + tests RTL

## CI

- [ ] **TASK-RANKING-UX-09** — `pnpm test:ci` green + PR a `dev`
