# Spec: Perfil de usuario — Cliente

**Estado**: En progreso  
**Pod**: `apps/client/src/containers/profile/`  
**Layout**: `AppShell`

---

## Ruta

| Ruta | Vista | Acceso |
| ---- | ----- | ------ |
| `/profile` | `ProfileView` | Cualquier usuario autenticado |

---

## Secciones

| Sección | user | teacher | admin |
| ------- | :--: | :-----: | :---: |
| Cuenta (avatar, rol, userId) | ✓ | ✓ | ✓ |
| Logros (`#achievements`) | ✓ | ✓ | ✓ |
| Ranking (nickname, opt-in) | ✓ | ✓ | ✓ |
| Preferencias (tema, idioma) | ✓ | ✓ | ✓ |

Logros: `GET /achievements` vía `useAchievements`. Galería categorizada con iconos Lucide. Ver [achievements.md](achievements.md).

Ranking usa `PATCH /users/me/ranking-profile` vía `useRankingProfile`.

---

## Sidebar footer

Orden (de arriba abajo):

1. **SidebarUserBlock** — avatar + nombre → `/profile`
2. **ThemeToggle** + **LocaleToggle** (variant `pill`)
3. **Cerrar sesión** — icono Lucide `LogOut`

El dialog `UserProfileMenu` deja de ser entry point; CTAs de ranking navegan a `/profile`.

---

## i18n

Namespaces `profile.*` y reutilización de `profileMenu.*` en sección ranking.
