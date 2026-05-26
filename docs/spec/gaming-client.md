# Spec: Gaming — Cliente

## Visión de producto
La feature de Gaming es el núcleo interactivo de la plataforma. Permite a los usuarios (invitados o registrados) enfrentarse a *flashcards* con un enfoque en fonética real, *connected speech* y expresiones nativas. 

El flujo está diseñado para ser de muy baja fricción (permitiendo a usuarios invitados jugar inmediatamente) mientras que reserva opciones avanzadas (configuración de partida, pausar/reanudar, métricas históricas) para usuarios autenticados.

## Rutas nuevas
Las nuevas rutas se ubicarán bajo el namespace `/game`.

- `/game` — Punto de entrada.
  - **Comportamiento Logged**: Muestra el `GameConfigContainer` (Configuración de partida).
  - **Comportamiento Guest**: Inicia automáticamente una partida rápida (random/10) y redirige a `/game/:gameId`.
- `/game/:gameId` — Pantalla de partida en curso (`GameContainer`).
- `/game/:gameId/summary` — Pantalla de resumen (`SummaryContainer`).

## Flujos

### Flujo 1 — Landing → Jugar ahora
1. En la `/` (LandingView), se agrega un *Call to Action* primario: "Jugar ahora".
2. Se muestra una sección con 2-3 *flashcards* estáticas/hardcodeadas para ilustrar la mecánica de giro (flip) y despertar el interés del usuario.
3. Al hacer clic en "Jugar ahora", se abre `AuthGateModal` encima de la landing (sin cambio de ruta).

### Flujo 2 — Auth gate
1. `AuthGateModal` se muestra sobre la landing.
2. Opciones:
   - Iniciar sesión (redirige a `/auth/login`).
   - Registrarse (redirige a `/auth/register`).
   - "Jugar como invitado" (cierra modal y navega a `/game`).

### Flujo 3 — Configuración de partida (solo logged)
1. Usuario autenticado entra a `/play`.
2. Se muestra un formulario donde selecciona:
   - **Módulo**: Selección de categoría o módulo.
   - **Cantidad de tarjetas**: `10`, `20` o `50`.
3. Al enviar, se hace `POST /v1/games` con `mode: 'game'` fijo. Con el `gameId` resultante, se redirige a `/play/:gameId`.

### Flujo 4 — Partida en curso
1. El usuario está en `/game/:gameId`.
2. El backend devolvió un arreglo de `flashcardIds`.
3. Se muestra **una flashcard a la vez**.
4. **Frente de la tarjeta**:
   - Texto de la expresión.
   - 3 botones de audio (ejercicios auditivos de la expresión).
5. **Acción de giro**: Al presionar la tarjeta o un botón de "Ver respuesta", se aplica una animación CSS 3D (flip).
6. **Dorso de la tarjeta**:
   - Expresión + Traducción (meaning).
   - Notación IPA.
   - Botón de audio de `nativeSpeech`.
   - Ejemplos de uso con sus respectivos audios.
   - Icono de micrófono (botón deshabilitado/bloqueado indicando "función premium futura").
7. **Resolución**: Debajo de la tarjeta (una vez volteada), aparecen dos botones: ✅ (Correcto) / ❌ (Incorrecto).
8. Al seleccionar, se llama a `POST /v1/games/:id/attempts` en **fire & forget** (no bloquea la UI). Se pasa inmediatamente a la siguiente tarjeta.

### Flujo 5 — Post-partida (repetir fallidas)
1. Al terminar la última tarjeta, si hubo errores, se intercepta el paso al resumen.
2. Se muestra un modal: "¿Repetir fallidas?".
3. **Puro Frontend**: Si acepta, se reinicia la UI de partida **solo con los IDs de las tarjetas falladas**. No se crea un nuevo `game` en el backend; se re-utilizan los objetos de flashcard ya en caché.
4. Si rechaza o al terminar la repetición, se llama a `POST /v1/games/:id/complete` y se redirige a `/play/:gameId/summary`.

### Flujo 6 — Resumen
1. En `/play/:gameId/summary`, se muestran las métricas:
   - Correctas / Total.
   - Precisión (Accuracy).
   - Duración.
2. **Acciones**:
   - "Jugar de nuevo" (Redirige a `/play`).
   - (Solo logged) "Elegir otro módulo" (Redirige a `/play`).

## Componentes nuevos

Siguiendo el patrón Container/Presentational dentro de `apps/client/src/pods/gaming`:

- **Containers**:
  - `GameConfigContainer`: Maneja estado del formulario y llamada a `useCreateGame`.
  - `GameContainer`: Maneja la lógica de la partida, el índice actual, y el array de IDs.
  - `SummaryContainer`: Obtiene los resultados y muestra el fin de juego.
- **Presentational**:
  - `AuthGateModal`: UI de selección de tipo de jugador.
  - `FlashcardBoard`: Layout principal del juego (progreso, botón pausar).
  - `Flashcard`: Componente core con la animación de flip. Recibe los datos de la tarjeta.
  - `FlashcardFront` / `FlashcardBack`: Subcomponentes visuales.
  - `GameSummary`: UI de las estadísticas finales.

## Estado (Zustand slice o local state)

- **Local State** (`GameContainer`): 
  - `currentIndex` (número).
  - `wrongIds` (array de strings) - para el flujo de repetir fallidas.
  - `isFlipped` (boolean).
- **Zustand** (`useGamingStore`): Opcional. No es estrictamente necesario si `GameContainer` puede mantener el estado de la partida activa, pero útil si se quiere persistir el estado entre navegaciones accidentales (aunque para usuarios logged, el backend ya soporta pausa).

## API calls (TanStack Query)

Ubicadas en `apps/client/src/pods/gaming/api/`:

- `useCreateGame`: `POST /v1/games`
- `useRegisterAttempt`: `POST /v1/games/:id/attempts` — fire & forget, no bloquea la UI.
- `useCompleteGame`: `POST /v1/games/:id/complete`
- `useUpdateGame`: `PATCH /v1/games/:id` (para pausar/abandonar).
- `useResumeGame`: `GET /v1/games/:id/resume`
- `useFlashcard`: `GET /v1/flashcards/:id` (Fetch individual).

## Restricciones y reglas de negocio
1. **Invitados**:
   - Saltan la configuración. Payload forzado: `{ mode: 'random', cardCount: 10 }`.
   - No pueden pausar la partida (no se muestra botón "Pausar").
   - No guardan historial a largo plazo (el backend no los asocia a un user).
2. **Logged Users**:
   - Tienen acceso a configurar el módulo y cantidad.
   - Pueden pausar (`PATCH /v1/games/:id` con `status: 'paused'`).
3. **Invitados que abandonan a mitad de partida**:
   - No se persiste nada. Si cierran la pestaña o navegan fuera, la partida se pierde.
   - No se usa `sessionStorage` ni ningún mecanismo de recuperación.
   - Al **completar** una partida, se les muestra en el resumen un CTA: "Registrate para no perder tu progreso".

## Decisiones de diseño

1. **`mode` fijo a `game`**: El campo `mode` siempre se envía como `game` al backend. El modo `study` (marcar flashcards como estudiadas) requiere un BC de progreso/spaced-repetition que no existe todavía. Se activará cuando ese BC esté implementado.
2. **Lazy Fetching de Flashcards**: 
   - El endpoint de creación devuelve un array de `flashcardIds`.
   - El cliente **NO** hace un fetch masivo (Promise.all) de todas. Como la UI muestra una a la vez, se utilizará TanStack Query para hacer fetch de la tarjeta actual (`useFlashcard(currentId)`) y, opcionalmente, pre-fetch de la `currentId + 1` en background para evitar demoras.
2. **Animación de Flip**: 
   - Se utilizarán **CSS 3D transforms** (`preserve-3d`, `backface-visibility: hidden`, `rotateY(180deg)`) nativos de Tailwind. No se añadirán librerías externas de animación (ej. Framer Motion) solo para esto, manteniendo el bundle ligero.
3. **Botón de Micrófono (Pronunciation)**:
   - Se renderizará en el dorso de la tarjeta con opacidad reducida (`--color-text-muted`) y un icono de candado, interceptando el click con un tooltip: "Próximamente".
4. **Repetir Fallidas en Frontend**:
   - Este flujo no genera nuevas partidas en la API. Es un *loop* puramente de UI. Los `flashcardIds` fallados se meten en una cola temporal y se muestran nuevamente. Solo al vaciar la cola o cancelar, se hace el `POST /v1/games/:id/complete` finalizando oficialmente la partida con las métricas finales (calculadas sobre el intento original, no las repeticiones).
5. **Landing estática**:
   - Las tarjetas de demostración en la landing usarán datos mockeados en el cliente. No consumirán la API para asegurar que el LCP (Largest Contentful Paint) y TTI (Time to Interactive) de la landing sean instantáneos.