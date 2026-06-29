# Tasks: Study Mode

**Spec API**: [docs/spec/study.md](../spec/study.md)  
**Spec Cliente**: [docs/spec/study-client.md](../spec/study-client.md)  
**ADR**: [docs/adr/027-study-mode-architecture.md](../adr/027-study-mode-architecture.md)

---

## Bloque 1 — Documentación

- [x] ADR-027
- [x] spec/study.md + study-client.md
- [x] Actualizar game-mechanics, gaming-client, progress, bounded-contexts-detail
- [x] Diagramas gaming/views/

## Bloque 2 — Backend Gaming

- [x] Domain: `View`, `FlashcardViewedEvent`, excepciones
- [x] `Game.recordView`, pending/complete por mode
- [x] `ViewRecorder` + controller `POST /games/:id/views`
- [x] Migración `game_views`
- [x] `GameStarter`: StudyRequiresAuth, weakest en game only
- [x] `AttemptRecorder`: AttemptRequiresGameMode
- [x] Tests unit + E2E

## Bloque 3 — Backend Progress / guards

- [x] Handler `FlashcardViewed` → recordStudy
- [x] Study level query + GET /progress/modules extendido
- [x] gamesCompleted filtra mode=game
- [x] Achievement evaluator filtra mode=game

## Bloque 4 — Frontend

- [x] Pod study + rutas /study
- [x] Sidebar + auth guard
- [x] Stats Study Level UI + i18n

## Bloque 5 — Tests finales

- [x] E2E API study flow
- [x] Client RTL useStudySession / StudyComponent
