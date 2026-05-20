# ADR-009: ElevenLabs para generación de audio

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Cada flashcard necesita audio de alta calidad en tres acentos: americano, británico y australiano. Se necesita un servicio de síntesis de voz que suene natural y nativo.

## Decision

Usar **ElevenLabs** para generar los archivos de audio de las flashcards.

## Rationale

- ElevenLabs ofrece la síntesis de voz de mayor calidad disponible — voces indistinguibles de nativos reales
- Disponible en múltiples acentos del inglés (americano, británico, australiano)
- El audio se genera **offline** (pipeline de backoffice) — no en tiempo real durante el juego
- Al generarse una sola vez y almacenarse en CDN, el coste es predecible y acotado
- API REST simple con SDK oficial para Node.js

## Alternatives Considered

- **Google Text-to-Speech**: calidad inferior, voces menos naturales
- **Amazon Polly**: calidad media, acentos menos convincentes para el propósito del producto
- **OpenAI TTS**: buena calidad pero sin variedad de acentos del inglés suficiente

## Consequences

- El pipeline de generación se ejecuta desde el backoffice de admin al crear/editar una flashcard
- Cada flashcard genera hasta 3 archivos de audio (×3 acentos)
- Los archivos generados se suben automáticamente a Cloudflare R2 (ver ADR-005)
- El coste de ElevenLabs se controla porque no hay generación en tiempo real
- Se necesita variable de entorno `ELEVENLABS_API_KEY` en el backend
