# Spec: Home hub — Cliente

**Estado**: En progreso  
**Pod**: `apps/client/src/containers/home/`  
**Layout**: `AppShell`

---

## Ruta

| Ruta | Vista | Acceso |
| ---- | ----- | ------ |
| `/home` | `HomeView` | Usuarios autenticados (user, teacher, admin) |

Hub de bienvenida post-login (estilo Notion/tutorial). Cards de acceso rápido filtradas por rol.

---

## Post-login

Destino por defecto tras login/registro/OAuth: `/home`, salvo:

1. `returnTo` en router state o `sessionStorage` (`idct-return-to`)
2. Si `idct-home-entered` ya está en sessionStorage → `idct-last-route` o `/home`

Ver `core/navigation/sessionNav.ts`.

---

## Contenido

| Sección | Descripción |
| ------- | ----------- |
| Welcome | Saludo + badge de rol |
| Quick start | 3 pasos numerados (tutorial) |
| Action grid | Cards clicables por rol |

### Cards por rol

| Card | user | teacher | admin | Condición |
| ---- | :--: | :-----: | :---: | --------- |
| Jugar | ✓ | ✓ | ✓ | — |
| Estudiar | ✓ | ✓ | ✓ | `canStudy` |
| Mi progreso | ✓ | ✓ | ✓ | — |
| Ranking | ✓ | — | — | `isUser` |
| Perfil | ✓ | ✓ | ✓ | — |
| Backoffice | — | ✓ | ✓ | `canAccessBackoffice` |
| Flashcards | — | — | ✓ | `canManageFlashcards` |
| Observabilidad | — | — | ✓ | `canAccessObservability` |

---

## i18n

Namespace `home.*`.

---

## Sidebar

Item **Inicio** → `/home` como primera entrada de navegación.
