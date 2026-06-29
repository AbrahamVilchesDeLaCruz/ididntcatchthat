# Spec: Study Mode — Cliente

**Estado**: Implementado  
**Fecha**: 2026-06-29  
**Pod**: `apps/client/src/containers/study/`  
**API**: [docs/spec/study.md](./study.md)

---

## Rutas

| Ruta | Vista | Descripción |
| ---- | ----- | ----------- |
| `/study` | `StudyConfigView` | Configuración (módulo + cantidad) |
| `/study/:sessionId` | `StudyView` | Sesión en curso |
| `/study/:sessionId/summary` | `StudySummaryView` | Resumen con racha |

Shell: `GameShell` (sin sidebar, foco en la carta).

---

## Auth

- Solo usuarios registrados (`userType === 'user'`)
- Guest en `/study` → redirect a `/auth/login?return=/study`
- Sin atajo guest desde landing

---

## Flujos

### Configuración

1. Usuario elige módulo, subcategoría (opcional) y cantidad (10/20/50)
2. `POST /games { mode: 'study', module, subcategory, cardCount }`
3. Navega a `/study/:sessionId` con `flashcardIds` en state

### Sesión

1. Muestra flashcard con flip y audio (misma mecánica que juego)
2. Tras voltear: botón **Siguiente** (no ✓/✗)
3. `POST /games/:id/views { flashcardId }` fire-and-forget
4. Pausa disponible → `/study` con banner + panel pausadas (badge "Estudio")
5. Sin modal "repetir fallidas"

### Resumen

- Cartas vistas, duración
- Racha actual (desde `GET /progress/summary`)
- CTAs: "Estudiar de nuevo", "Jugar ahora"

---

## Estilo visual

- Sin `game-glow` / shimmer arcade
- Tokens calmados del design system
- Copy orientado a aprendizaje, no competición

---

## Componentes

```
containers/study/
├── api/study.api.ts
├── hooks/useStudySession.ts
├── StudyConfigContainer.tsx / Component
├── StudyContainer.tsx / Component
├── StudySummaryContainer.tsx / Component
└── study.types.ts
```

Reutiliza: `game.audio.ts`, `PausedGamesPanel`, hooks pause/resume/patch/complete.

---

## Navegación

- `AppSidebar`: sección "Aprender" → **Estudiar** (`/study`, solo logged)
- Stats: Study Level badge junto a mastery en `ModuleProgressChart`

---

## TanStack Query

- `useCreateStudySession` → `POST /games mode: study`
- `useRecordView` → `POST /games/:id/views`
- Reutiliza `usePatchGame`, `useResumeGame`, `useCompleteGame`, `useGameFlashcards`
- Invalidar `statsKeys.all` y `progressSummary` al completar
