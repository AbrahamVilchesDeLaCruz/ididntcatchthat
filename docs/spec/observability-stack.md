# Spec: Observability Stack — Fase 1

**Change**: `feat/observability-stack`  
**Estado**: Aprobado  
**Fecha**: 2026-05-22  
**ADRs relacionados**: ADR-010, ADR-020

---

## Contexto

La plataforma no tiene visibilidad sobre su comportamiento en producción. Sin logs estructurados, métricas HTTP ni dashboards, cualquier error o degradación de rendimiento es invisible hasta que un usuario lo reporta.

Esta spec cubre la **Fase 1** según ADR-020: infraestructura de observabilidad (Docker Compose) + instrumentación en la API (Logger interface + PinoLogger + MetricsInterceptor).

La Fase 2 (OTel traces, Loki transport, Grafana dashboards como código) queda fuera de scope.

---

## Scope

| Área                                        | Incluido  |
| ------------------------------------------- | --------- |
| Docker Compose: Prometheus + Grafana + Loki | ✅        |
| `Logger` interface + `PinoLogger` en API    | ✅        |
| `MetricsInterceptor` HTTP con prom-client   | ✅        |
| `/metrics` endpoint en API                  | ✅        |
| Makefile targets para observability         | ✅        |
| OTel SDK / traces                           | ❌ Fase 2 |
| Grafana dashboards como código              | ❌ Fase 2 |
| Loki transport (pino → Loki directo)        | ❌ Fase 2 |
| Alertas Prometheus                          | ❌ Fase 2 |

---

## Requerimientos

### R1 — Servicios de observabilidad en Docker Compose

El sistema DEBE incluir Prometheus, Grafana y Loki como servicios en `docker-compose.yml` (base) con overrides en `docker-compose.dev.yml` y `docker-compose.prod.yml`.

Los servicios DEBEN arrancar con `make up` sin configuración manual adicional.

Prometheus DEBE estar configurado para hacer scrape del endpoint `/metrics` de la API cada 15 segundos.

Grafana DEBE arrancar con Prometheus y Loki preconfigurados como datasources (provisioning como archivos YAML).

Los datos de Prometheus y Grafana DEBEN persistir en Docker volumes nombrados para sobrevivir reinicios.

#### Escenario: Levantar stack completo en local

- DADO que el developer ejecuta `make up`
- CUANDO todos los containers arrancan
- ENTONCES `http://localhost:9090` sirve la UI de Prometheus
- Y `http://localhost:3100` responde al health check de Loki
- Y `http://localhost:3002` sirve Grafana con login

#### Escenario: Prometheus hace scrape de la API

- DADO que la API está corriendo y expone `/metrics`
- CUANDO Prometheus ejecuta su ciclo de scrape (cada 15s)
- ENTONCES el target `api` aparece como `UP` en `http://localhost:9090/targets`

#### Escenario: Grafana tiene datasources configurados

- DADO que Grafana arranca por primera vez
- CUANDO el usuario accede a `http://localhost:3002`
- ENTONCES Prometheus y Loki aparecen como datasources sin configuración manual

---

### R2 — Logger interface agnóstica en el dominio

La API DEBE exponer una interfaz `Logger` en `shared/domain/` que no importe ninguna librería externa.

El código de dominio y aplicación DEBE inyectar `Logger` vía Symbol DI — nunca importar Pino directamente.

La interfaz DEBE soportar los niveles: `info`, `warn`, `error`, `debug`.

Cada llamada DEBE aceptar un mensaje string y un contexto opcional `Record<string, unknown>`.

#### Escenario: Use case usa el logger sin acoplarse a Pino

- DADO un use case que recibe `Logger` por inyección
- CUANDO llama a `this.logger.info('user created', { userId })`
- ENTONCES el mensaje se emite sin importar la implementación concreta

---

### R3 — PinoLogger como implementación de infraestructura

La API DEBE tener `PinoLogger` en `shared/infrastructure/` implementando la interfaz `Logger`.

Los logs DEBEN emitirse en formato JSON estructurado con los campos: `level`, `time`, `msg`, `context`.

En entorno `development` los logs DEBEN mostrarse en formato pretty (legible por humanos) vía `pino-pretty`.

En entorno `production` los logs DEBEN emitirse como JSON puro (sin pretty).

#### Escenario: Log en desarrollo es legible

- DADO `NODE_ENV=development`
- CUANDO la API arranca
- ENTONCES los logs aparecen formateados con colores y timestamps legibles

#### Escenario: Log en producción es JSON puro

- DADO `NODE_ENV=production`
- CUANDO la API procesa un request
- ENTONCES el log es una línea JSON válida parseable por Loki

---

### R4 — Endpoint `/metrics` expuesto por la API

La API DEBE exponer `GET /metrics` que devuelva métricas en formato Prometheus text exposition.

El endpoint DEBE estar excluido del global prefix `api/v1`.

El endpoint DEBE estar excluido de Swagger.

#### Escenario: Prometheus puede hacer scrape

- DADO que la API está corriendo
- CUANDO se hace `GET /metrics`
- ENTONCES la respuesta tiene `Content-Type: text/plain; version=0.0.4`
- Y contiene métricas estándar de Node.js (heap, event loop, etc.)

---

### R5 — MetricsInterceptor registra métricas HTTP

La API DEBE tener un `MetricsInterceptor` global que registre por cada request:

- `http_requests_total` — counter con labels `method`, `route`, `status_code`
- `http_request_duration_seconds` — histogram con labels `method`, `route`

El interceptor DEBE aplicarse globalmente — sin necesidad de decorarlo en cada controller.

#### Escenario: Request exitoso genera métricas

- DADO que `MetricsInterceptor` está activo
- CUANDO se hace `GET /health`
- ENTONCES `http_requests_total{method="GET",route="/health",status_code="200"}` se incrementa en 1
- Y `http_request_duration_seconds` registra la duración del request

#### Escenario: Request fallido también genera métricas

- DADO que un endpoint lanza un error
- CUANDO la request resulta en 500
- ENTONCES `http_requests_total{status_code="500"}` se incrementa

---

## Estructura de archivos esperada

```
docker-compose.yml                          ← añadir: prometheus, grafana, loki
docker-compose.dev.yml                      ← puertos dev: 9090, 3100, 3002
docker-compose.prod.yml                     ← puertos prod: internos (nginx proxy)
infra/
├── prometheus/
│   └── prometheus.yml                      ← scrape config
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yml             ← Prometheus + Loki automáticos
        └── dashboards/
            └── dashboards.yml              ← (vacío en Fase 1)

apps/api/src/shared/
├── domain/
│   └── logger.port.ts                      ← interfaz Logger
└── infrastructure/
    ├── framework/
    │   └── shared.module.ts                ← registrar PinoLogger + MetricsInterceptor
    ├── logger/
    │   └── pino-logger.ts                  ← implementación PinoLogger
    └── metrics/
        ├── metrics.controller.ts           ← GET /metrics
        └── metrics.interceptor.ts          ← MetricsInterceptor global
```

---

## Dependencias a instalar

```bash
# API
pnpm --filter @ididntcatchthat/api add pino pino-pretty prom-client
pnpm --filter @ididntcatchthat/api add -D @types/pino
```

---

## Criterios de aceptación

- [ ] `make up` levanta api, client, prometheus, grafana, loki sin errores
- [ ] `curl http://localhost:3001/health` responde `200`
- [ ] `curl http://localhost:3001/metrics` devuelve métricas Prometheus
- [ ] Prometheus target `api` aparece como `UP` en `localhost:9090/targets`
- [ ] Grafana arranca con Prometheus como datasource en `localhost:3002`
- [ ] Logs de la API en dev son legibles (pino-pretty)
- [ ] Un use case puede inyectar `Logger` sin importar Pino
