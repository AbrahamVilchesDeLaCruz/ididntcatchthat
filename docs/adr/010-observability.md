# ADR-010: Observabilidad con OpenTelemetry + Prometheus + Grafana + Loki

**Date**: 2026-05-20  
**Status**: Accepted

## Context

El proyecto necesita observabilidad para monitorizar tanto métricas técnicas (latencia, errores) como métricas de negocio y aprendizaje (streaks, fonemas problemáticos, accuracy score). Se debe decidir el stack de observabilidad.

## Decision

Usar un stack **self-hosted** compuesto por:

- **OpenTelemetry** — instrumentación estándar (trazas, métricas, logs)
- **Prometheus** — recolección y almacenamiento de métricas
- **Grafana** — dashboards técnicos y de negocio
- **Loki** — logs centralizados
- **Pino** — structured logging en Node.js con correlation IDs

## Rationale

- Stack completamente gratuito y self-hosted — cero coste adicional
- OpenTelemetry es el estándar de la industria — vendor-neutral
- Grafana + Prometheus + Loki es la combinación más usada en producción real
- Demuestra conocimiento de observabilidad cloud-native en el TFM
- Todos los servicios corren en Docker Compose en la VPS junto a la aplicación

## Alternatives Considered

- **Datadog / New Relic**: excelentes pero de pago — no justificado para un TFM
- **AWS CloudWatch**: atado a AWS, no aplica con VPS propia

## Consequences

- La VPS necesita reservar recursos para el stack de observabilidad
- Structured logging con Pino desde el día uno — correlation IDs en todas las requests
- Dashboards separados: uno técnico (latencia, errores, trazas) y uno de negocio (aprendizaje)
- Las métricas de negocio se exponen como métricas custom en Prometheus
