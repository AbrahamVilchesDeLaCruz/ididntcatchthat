# ADR-027: Modo estudio — sesión unificada en Gaming BC

**Fecha**: 2026-06-29  
**Estado**: Aceptado  
**Contexto**: Integración del modo estudio end-to-end

---

## Contexto

El producto define dos modos sobre el mismo contenido de flashcards:

| Modo | Propósito | Afecta accuracy | Afecta streak |
| ---- | --------- | :-------------: | :-----------: |
| **Estudio** | Repasar sin presión | No | Sí |
| **Juego** | Evaluarse y competir | Sí | Sí |

La documentación original ([game-mechanics.md](../domain/game-mechanics.md)) afirmaba que el estudio no generaba `Game` ni `Attempt`. El BC Gaming ya modelaba `GameMode.Study` y Progress ya consumía `AttemptRecordedEvent` con `mode = study`.

El cliente difería study hasta que existiera Progress BC — condición ya cumplida.

---

## Decisión

### 1. Reutilizar el aggregate `Game` como sesión de aprendizaje

`Game` representa una **sesión** (juego o estudio), no solo una partida evaluativa. El discriminador es `mode: study | game`.

### 2. Endpoint dedicado `POST /games/:id/views` para estudio

El estudio usa interacción "Siguiente" sin auto-evaluación (sin `correct`). Se crea:

- Entidad `View` y tabla `game_views`
- Evento `FlashcardViewedEvent` → Progress actualiza `times_studied`

Los intentos (`POST /games/:id/attempts`) quedan **exclusivos del modo juego**.

### 3. Solo usuarios registrados

`POST /games { mode: 'study' }` rechaza tokens guest con `StudyRequiresAuth` (403).

### 4. Pausa y retoma compartidas

Study reutiliza `PATCH paused`, `GET resume` y límite de 5 sesiones pausadas del flujo existente.

### 5. Study Level en Progress BC

Cobertura por módulo: `flashcards_vistas / flashcards_totales`. Expuesto en `GET /progress/modules` como `studyLevel` y `studyCoverage`.

---

## Alternativas descartadas

| Alternativa | Motivo de descarte |
| ----------- | ------------------ |
| BC Study independiente | Duplica pausa, selector, límites y persistencia de sesión |
| Reutilizar `attempts` con `correct: true` fijo | Semántica confusa; mezcla evaluación con visualización |
| Study sin sesión (solo eventos sueltos) | Imposible pausar/retomar con precisión |

---

## Consecuencias

- Actualizar [game-mechanics.md](../domain/game-mechanics.md): tracking vía sesión + views
- Ranking y logros de juego filtran por `mode = 'game'`
- `gamesCompleted` en summary filtra solo partidas de juego
- Cliente: rutas `/study` separadas de `/game`
