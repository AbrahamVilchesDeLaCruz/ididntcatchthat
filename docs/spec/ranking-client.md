# Spec: Ranking — Cliente

**Estado**: En progreso  
**Pod**: `apps/client/src/containers/ranking/`  
**API**: [docs/spec/ranking.md](./ranking.md)

---

## Rutas

| Ruta | Vista | Layout |
| ---- | ----- | ------ |
| `/ranking` | `RankingView` | `AppShell` (sidebar) |
| `/home` | `HomeView` | `AppShell` — hub post-login |
| `/profile` | `ProfileView` | `AppShell` — cuenta, ranking, preferencias |

Acceso: usuarios registrados, admin y backoffice (`Mi progreso → Ranking`).

---

## Perfil de ranking

El nickname y el opt-in **no** se editan en la página de ranking.

- Página dedicada: [`/profile`](../../apps/client/src/views/ProfileView.tsx) — sección ranking (`#ranking`).
- Footer sidebar: `SidebarUserBlock` → `/profile`.
- CTAs en ranking con `viewer.status === 'hidden'` navegan a `/profile#ranking`.
- Hook compartido: `core/profile/useRankingProfile.ts`.

---

## Página de ranking

| Componente | Rol |
| ---------- | --- |
| `RankingContainer` | Queries, mutations, error state |
| `RankingComponent` | Layout: título, filtros, leaderboard, banners viewer |
| `RankingFilters` | Tipo, período, módulo |
| `RankingPodium` | Top 3 — layout clásico 2º–1º–3º, Lucide Trophy/Medal |
| `RankingLeaderboard` | Podio + tabla ranks 4+ |

### Podio

- 1º centrado y más alto; 2º izquierda; 3º derecha.
- Avatar DiceBear por `userId`, nickname, score + unidad.
- Iconos Lucide (sin emojis).
- Entrada `isMe`: anillo brand + badge «Tú».

### Banners según `viewer.status`

| status | UI |
| ------ | -- |
| `hidden` | CTA «Configura tu perfil» → `/profile#ranking` |
| `visible_unranked` | Info «Visible en rankings — juega para aparecer» |
| `ranked` + fuera top N | Card con posición `#N` y score |
| `ranked` + en lista | Highlight en podio/tabla |

---

## Respuesta API consumida

Ver [ranking.md](./ranking.md#respuesta-api). El cliente mapea:

- `entries[].isMe` — highlight server-side
- `viewer` — banners y estado opt-in
- `currentUser` — compatibilidad posición fuera del top N

---

## i18n

Namespace `ranking.*` + `profileMenu.*` para dialog sidebar.
