# Tasks: Gaming — Cliente

**Spec**: [docs/spec/gaming-client.md](../spec/gaming-client.md)  
**Rama**: `feat/gaming-bc`  
**Orden**: secuencial — cada bloque depende del anterior

> **TDD obligatorio**: tests RED → GREEN → REFACTOR antes de cada Container, hook, mapper y flujo crítico.

---

## Bloque 1 — Infraestructura y rutas

- [ ] **TASK-GAMING-CLIENT-01 — Registrar rutas y views de Gaming**
  - **Archivos**: `core/router/AppRouter.tsx`, `views/GameConfigView.tsx`, `views/GameView.tsx`, `views/GameSummaryView.tsx`.
  - **Criterios**: existen `/game`, `/game/:gameId`, `/game/:gameId/summary`; `/game` decide config logged vs auto-start guest.
  - **Skill/Patrón**: `client-pods`, `client-container-presentational`.

- [ ] **TASK-GAMING-CLIENT-02 — Crear pod `game` y tests RED iniciales**
  - **Archivos**: `containers/game/*`, `containers/game/__tests__/*`, `containers/game/index.ts`.
  - **Criterios**: el pod exporta sus Containers y quedan tests fallando por render básico.
  - **Skill/Patrón**: `client-pods`, `client-testing`, `tdd-workflow`.

## Bloque 2 — Landing: CTA + Auth gate modal + demo flashcards

- [ ] **TASK-GAMING-CLIENT-03 — Agregar CTA y demo estática en landing**
  - **Archivos**: `containers/landing/LandingContainer.tsx`, `LandingComponent.tsx`, `components/LandingHero.tsx`, `components/LandingGameDemo.tsx`.
  - **Criterios**: la landing muestra 2-3 cards mockeadas con flip visual y CTA primario sin cambio de ruta.
  - **Skill/Patrón**: `client-container-presentational`.

- [ ] **TASK-GAMING-CLIENT-04 — Implementar `AuthGateModal`**
  - **Archivos**: `containers/landing/components/AuthGateModal.tsx`, `containers/landing/__tests__/LandingComponent.test.tsx`.
  - **Criterios**: abre sobre landing; login/register navegan a `/auth/*`; guest cierra modal y va a `/game`.
  - **Skill/Patrón**: `client-container-presentational`, `client-testing`.

## Bloque 3 — API layer (hooks TanStack Query + api models)

- [ ] **TASK-GAMING-CLIENT-05 — Definir api-models, types y mapper**
  - **Archivos**: `containers/game/api/game.api-model.ts`, `game.types.ts`, `game.mapper.ts`, `__tests__/game.mapper.test.ts`.
  - **Criterios**: cubre create/resume/complete/detail; fechas a `Date`; payloads fuerzan `mode: 'game'`.
  - **Skill/Patrón**: `client-api`, `client-testing`.

- [ ] **TASK-GAMING-CLIENT-06 — Crear hooks TanStack Query del pod**
  - **Archivos**: `containers/game/api/game.api.ts`, `containers/game/api/index.ts`.
  - **Criterios**: expone `useCreateGame`, `useRegisterAttempt`, `useCompleteGame`, `useUpdateGame`, `useResumeGame`, `useFlashcard` y prefetch del siguiente card.
  - **Skill/Patrón**: `client-query`, `client-api`.

## Bloque 4 — Configuración de partida (/game)

- [ ] **TASK-GAMING-CLIENT-07 — Implementar `GameConfigContainer`**
  - **Archivos**: `containers/game/GameConfigContainer.tsx`, `api/game.api.ts`, `__tests__/GameConfigContainer.test.tsx`.
  - **Criterios**: logged ve formulario; guest hace quick game (`/v1/games`) y navega al `gameId`; loading/error salen de Query.
  - **Skill/Patrón**: `client-container-presentational`, `client-query`, `client-testing`.

- [ ] **TASK-GAMING-CLIENT-08 — Construir `GameConfigComponent`**
  - **Archivos**: `containers/game/GameConfigComponent.tsx`, `components/GameConfigForm.tsx`, `__tests__/GameConfigComponent.test.tsx`.
  - **Criterios**: renderiza módulo, cardCount 10/20/50 y submit; no hace fetch ni routing.
  - **Skill/Patrón**: `client-container-presentational`.

## Bloque 5 — Partida en curso (/game/:gameId) — Flashcard + flip

- [ ] **TASK-GAMING-CLIENT-09 — Modelar estado local de partida**
  - **Archivos**: `containers/game/hooks/useGameSession.ts`, `containers/game/hooks/index.ts`, `__tests__/hooks/useGameSession.test.ts`.
  - **Criterios**: maneja `currentIndex`, `isFlipped`, `wrongIds` y reinicio de repetición sin depender de Zustand.
  - **Skill/Patrón**: `client-hooks`, `client-testing`.

- [ ] **TASK-GAMING-CLIENT-10 — Implementar `GameContainer`**
  - **Archivos**: `containers/game/GameContainer.tsx`, `__tests__/GameContainer.test.tsx`.
  - **Criterios**: usa `useResumeGame`, fetch de la card actual, prefetch de la siguiente y attempts fire & forget con avance inmediato.
  - **Skill/Patrón**: `client-container-presentational`, `client-query`, `client-testing`.

- [ ] **TASK-GAMING-CLIENT-11 — Construir board, flashcard y flip 3D**
  - **Archivos**: `containers/game/GameComponent.tsx`, `components/{FlashcardBoard.tsx,Flashcard.tsx,FlashcardFront.tsx,FlashcardBack.tsx,AttemptActions.tsx}`.
  - **Criterios**: renderiza progreso, frente/dorso, audios, “Ver respuesta”, correcto/incorrecto y micrófono bloqueado con tooltip.
  - **Skill/Patrón**: `client-container-presentational`.

## Bloque 6 — Resumen (/game/:gameId/summary)

- [ ] **TASK-GAMING-CLIENT-12 — Implementar completion y navegación**
  - **Archivos**: `containers/game/GameContainer.tsx`, `api/game.api.ts`, `__tests__/GameContainer.test.tsx`.
  - **Criterios**: al terminar la cola original/repetición llama `POST /complete` una vez y navega al summary.
  - **Skill/Patrón**: `client-query`, `client-testing`.

- [ ] **TASK-GAMING-CLIENT-13 — Construir resumen final**
  - **Archivos**: `containers/game/{GameSummaryContainer.tsx,GameSummaryComponent.tsx}`, `components/GameSummary.tsx`, `__tests__/GameSummaryContainer.test.tsx`.
  - **Criterios**: renderiza correctas/total, accuracy y duration; guest ve CTA de registro; logged ve “Elegir otro módulo”.
  - **Skill/Patrón**: `client-container-presentational`, `client-testing`.

## Bloque 7 — Flujos de edge cases (guest CTA, prefetch, fire & forget)

- [ ] **TASK-GAMING-CLIENT-14 — Modal “Repetir fallidas” solo frontend**
  - **Archivos**: `containers/game/components/RepeatWrongAnswersModal.tsx`, `GameContainer.tsx`, `hooks/useGameSession.ts`.
  - **Criterios**: intercepta el resumen, reinyecta solo `wrongIds` y no crea nuevo game ni fetch masivo.
  - **Skill/Patrón**: `client-hooks`, `client-container-presentational`.

- [ ] **TASK-GAMING-CLIENT-15 — Pausa/abandono y restricciones guest**
  - **Archivos**: `containers/game/GameContainer.tsx`, `components/FlashcardBoard.tsx`, `__tests__/GameContainer.test.tsx`.
  - **Criterios**: logged puede pausar vía `PATCH`; guest no ve pausa y abandonar no usa recovery ni sessionStorage.
  - **Skill/Patrón**: `client-query`, `client-testing`.

- [ ] **TASK-GAMING-CLIENT-16 — Cobertura final de integración/E2E**
  - **Archivos**: `containers/game/__tests__/*.test.tsx`, `apps/client/e2e/gaming.spec.ts`.
  - **Criterios**: cubre landing→auth gate→guest quick game y logged config→game→summary con repeat wrong/fire & forget.
  - **Skill/Patrón**: `client-testing`, `tdd-workflow`.
