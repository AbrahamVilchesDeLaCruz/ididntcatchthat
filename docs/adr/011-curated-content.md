# ADR-011: Contenido curado por admins — sin IA generativa en el flujo del juego

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Se debatió si el contenido de las flashcards (expresiones, ejemplos, notas fonéticas) debería generarse dinámicamente con IA o ser creado y revisado por personas expertas.

## Decision

El contenido de las flashcards es **creado y curado por admins** (profesores nativos de inglés). No hay IA generativa en el flujo principal del juego.

## Rationale

- La propuesta de valor del producto es enseñar inglés **real y correcto** — requiere supervisión humana experta
- El contenido generado por IA puede contener errores fonéticos o expresiones incorrectas sin la revisión adecuada
- La IA generativa en el flujo del usuario añade latencia, coste por llamada y variabilidad en la calidad
- El contenido curado permite control de calidad, coherencia pedagógica y progresión estructurada
- Esta es una **decisión de diseño**, no una limitación técnica

## Alternatives Considered

- **IA generativa por usuario**: personalización máxima pero calidad no garantizada y coste escalable
- **IA + revisión humana**: pipeline más complejo sin beneficio claro para el TFM

## Consequences

- Los admins tienen un backoffice para crear y editar flashcards
- Al crear una flashcard, se dispara el pipeline de generación de audio (ElevenLabs)
- El contenido es estable y predecible — sin sorpresas en producción
- La IA se usa estratégicamente: generación de audio (ElevenLabs) y evaluación de pronunciación (Azure Speech)
