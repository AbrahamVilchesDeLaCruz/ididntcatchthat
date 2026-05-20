# ADR-005: Cloudflare CDN para archivos de audio

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Cada flashcard tiene hasta 3 archivos de audio (acento americano, británico y australiano) generados con ElevenLabs. Estos archivos necesitan servirse a los usuarios con baja latencia. Se debe decidir dónde almacenarlos y cómo servirlos.

## Decision

Usar **Cloudflare** (R2 + CDN) para almacenar y servir los archivos de audio.

## Rationale

- Servir archivos de audio directamente desde la VPS consumiría ancho de banda y CPU innecesariamente
- Cloudflare R2 tiene tier gratuito generoso (10GB almacenamiento, sin coste por egress)
- La CDN de Cloudflare distribuye los archivos globalmente — latencia mínima para el usuario
- Los archivos se generan una sola vez (pipeline offline) y se sirven infinitas veces sin coste adicional
- Desacopla el almacenamiento de audio de la infraestructura de la aplicación

## Alternatives Considered

- **AWS S3 + CloudFront**: más caro, mayor complejidad de configuración
- **VPS directa**: satura el servidor con tráfico de assets estáticos
- **DigitalOcean Spaces**: menos red de distribución global que Cloudflare

## Consequences

- El pipeline de generación de audio sube los archivos a Cloudflare R2 tras generarlos con ElevenLabs
- Las URLs de audio en la DB apuntan al CDN de Cloudflare, no a la VPS
- La VPS no sirve ningún archivo de audio en producción
