# ADR-008: Azure Speech Service para evaluación de pronunciación

**Date**: 2026-05-20  
**Status**: Accepted

## Context

El bonus de pronunciación requiere analizar el audio del usuario y devolver una puntuación que indique qué tan cercana es su pronunciación a la de un nativo. Se necesita evaluar opciones de servicio.

## Decision

Usar **Azure Speech Service** para la evaluación de pronunciación en tiempo real.

## Rationale

- Azure Speech incluye **Pronunciation Assessment** nativo — devuelve scores por fonema, palabra y frase
- Tier gratuito: 5 horas de audio/mes — suficiente para el volumen de un TFM
- Alta calidad de análisis fonético comparado con alternativas gratuitas
- SDK oficial para Node.js con soporte activo
- Defendible académicamente como servicio de referencia en el sector

## Alternatives Considered

| Opción                      | Coste       | Calidad | Motivo de descarte                               |
| --------------------------- | ----------- | ------- | ------------------------------------------------ |
| Web Speech API              | Gratuita    | Básica  | Sin scoring de pronunciación por fonema          |
| Whisper + análisis fonético | Bajo (Groq) | Media   | Requiere pipeline adicional de análisis fonético |
| Google Speech-to-Text       | Bajo        | Alta    | Sin pronunciation scoring nativo                 |

## Consequences

- El flujo de pronunciación ocurre en **tiempo real** — único punto de IA en tiempo real con el usuario
- El audio se graba en el cliente y se envía al backend, que llama a Azure Speech
- Se necesita variable de entorno `AZURE_SPEECH_KEY` y `AZURE_SPEECH_REGION`
- El scoring se almacena en DB para métricas de progresión del usuario
