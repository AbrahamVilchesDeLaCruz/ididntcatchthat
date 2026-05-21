# ADR 020 — Estrategia de Observabilidad

**Estado**: Aceptado  
**Fecha**: 2026-05-21  
**Autores**: Abraham Vilches de la Cruz

---

## Contexto

La plataforma necesita visibilidad sobre su comportamiento en producción. Sin observabilidad no hay forma de diagnosticar errores, detectar degradación de rendimiento ni entender el comportamiento real de los usuarios.

Requisitos:
- Logs estructurados — consultables, filtrables, correlacionables con errores
- Métricas HTTP y de negocio — alertas sobre latencia y tasas de error
- Trazas distribuidas — entender el camino de un request a través de las capas
- Arquitectura clean — el código de dominio y aplicación no debe acoplarse a ninguna tecnología de observabilidad
- VPS propio — sin servicios cloud de pago (Datadog, New Relic)

---

## Decisión

**Pino + OpenTelemetry SDK como instrumentación. Loki + Prometheus + Grafana como storage y visualización.**

### Stack

| Señal | Instrumentación | Storage | Visualización |
|---|---|---|---|
| Logs | Pino (JSON) | Loki | Grafana |
| Metrics | prom-client | Prometheus | Grafana |
| Traces | OTel SDK (Fase 2) | Tempo | Grafana |

### Arquitectura clean

```
Domain/Application → Logger interface (semántica, agnóstica)
Infrastructure     → PinoLogger implements Logger
```

El dominio y la aplicación nunca importan pino, OTel ni prom-client. La única referencia al framework es `@Inject(LOGGER_SERVICE)` — un Symbol.

### Fases de implementación

**Fase 1 — ahora:**
- `Logger` interface + `PinoLogger` — logs JSON por consola
- `MetricsInterceptor` — métricas HTTP automáticas con prom-client
- Prometheus scrape configurado

**Fase 2 — antes de deploy prod:**
- `instrumentation.ts` con OTel SDK — traces automáticos (HTTP, TypeORM, RabbitMQ)
- Loki configurado en Docker Compose — pino envia logs vía transporte
- Grafana con dashboards preconfigurados (datasources como código)

La app no cambia entre fases — solo se añade config de infraestructura.

---

## Alternativas consideradas

### Winston
**Parcialmente rechazado** — Winston es más conocido pero más lento que pino y sin integración nativa con OTel. Pino tiene `pino-opentelemetry-transport` que correlaciona logs con trace IDs automáticamente.

### Datadog / New Relic
**Rechazado** — SaaS de pago. VPS propio con Grafana OSS cumple los mismos requisitos sin coste.

### Solo logs (sin métricas ni traces)
**Rechazado** — Los logs responden "qué pasó" pero no "cuánto tarda" ni "por dónde pasó". Las 3 señales se complementan — sin métricas no hay alertas, sin traces no hay flamegraphs.

### ELK Stack (Elasticsearch + Logstash + Kibana)
**Rechazado** — Elasticsearch consume demasiados recursos para un VPS. Loki es significativamente más ligero porque indexa solo metadatos, no el contenido completo de los logs.

---

## Consecuencias

**Positivas:**
- Código de dominio y aplicación 100% agnóstico a la tecnología de observabilidad
- Migración futura de pino a OTel completo sin tocar use cases ni handlers
- Loki mucho más ligero que ELK — adecuado para VPS
- Grafana unifica las 3 señales en un solo dashboard
- prom-client expone `/metrics` — Prometheus hace scrape sin agente adicional

**Negativas / trade-offs:**
- OTel añade latencia mínima (~1-2ms por request) — aceptable
- Fase 2 requiere configuración de infraestructura adicional en el VPS
- Retención de logs en Loki limitada por espacio en disco del VPS

---

## Referencias

- Setup operacional: [docs/observability.md](../observability.md)
- Skill de uso en código: [skills/api-observability/SKILL.md](../../skills/api-observability/SKILL.md)
- [Pino + OpenTelemetry transport](https://github.com/pinojs/pino-opentelemetry-transport)
- [Grafana Loki vs ELK](https://grafana.com/docs/loki/latest/overview/comparisons/)
