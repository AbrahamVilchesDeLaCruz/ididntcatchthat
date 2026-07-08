# ADR-012: Pipeline de audio offline

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Los archivos de audio podrían generarse en tiempo real cuando el usuario los solicita, o generarse una sola vez cuando el admin crea la flashcard y almacenarse para servirse desde CDN.

## Decision

El audio se genera **offline** — en el momento en que el admin crea o edita una flashcard, no cuando el usuario juega.

## Rationale

- Generación en tiempo real añadiría latencia perceptible al usuario (llamada a ElevenLabs + respuesta)
- ElevenLabs cobra por caracteres generados — el modelo offline genera cada audio una sola vez
- El audio almacenado en CDN se sirve con latencia mínima en cualquier parte del mundo
- Si ElevenLabs tiene downtime, el juego sigue funcionando — los audios ya están generados
- El coste es predecible: proporcional al número de flashcards, no al número de usuarios

## Pipeline

```
Admin crea/edita flashcard
        ↓
Backend llama a ElevenLabs API (×3 voces: americana, británica, australiana)
        ↓
Archivos de audio generados y subidos a Cloudflare R2
        ↓
URLs de audio guardadas en base de datos
        ↓
Usuario reproduce audio desde Cloudflare CDN (latencia mínima, sin coste por reproducción)
```

## Consequences

- La creación de flashcards es asíncrona — el admin no espera a que el audio se genere para continuar
- Si la generación de audio falla, la flashcard queda en `failed`; el admin puede reintentar con `POST /flashcards/:id/regenerate-audio` o editando expression/examples
- Los archivos de audio no viven en la VPS ni en la base de datos — solo las URLs en DB
- El backoffice muestra el estado de generación de audio por flashcard
