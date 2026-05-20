# ADR-004: PostgreSQL en Aiven (managed)

**Date**: 2026-05-20  
**Status**: Accepted

## Context

El proyecto necesita una base de datos relacional. Se debe decidir si se auto-hostea en la VPS o se usa un servicio managed.

## Decision

Usar **PostgreSQL** gestionado en **Aiven** en lugar de instalar PostgreSQL en la VPS propia.

## Rationale

- La VPS tiene recursos limitados — alojar la DB en ella comprometería el rendimiento de la aplicación y el stack de observabilidad
- Aiven ofrece tier gratuito suficiente para el volumen de un TFM
- Backups automáticos, alta disponibilidad y monitorización incluidos sin configuración
- Permite separar la DB de la aplicación — si la app falla, los datos están seguros
- Si en el futuro se necesita escalar la DB independientemente, ya está separada

## Alternatives Considered

- **PostgreSQL en VPS**: más control pero consume RAM/CPU que necesita la app

## Consequences

- La VPS no necesita gestionar backups ni mantenimiento de PostgreSQL
- La conexión entre VPS y Aiven añade latencia de red mínima (mismo datacenter si es posible)
- Variable de entorno `DATABASE_URL` apunta a Aiven en todos los entornos
