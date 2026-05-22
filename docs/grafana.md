# Grafana — Guía de uso

> Cómo acceder, explorar métricas y logs en **ididntcatchthat**.

---

## Acceso

Grafana no está expuesto públicamente. Accedés via SSH tunnel:

```bash
make tunnel-dev   # Grafana en http://localhost:3002
make tunnel-prod  # Grafana en http://localhost:3003
```

Login: `admin` / password guardado en Doppler como `GRAFANA_PASSWORD`.

---

## Arquitectura del stack

```
API (NestJS)
  ├── MetricsInterceptor → prom-client (en memoria)
  │       └── GET /metrics ← Prometheus (scrape cada 15s)
  │                             └── Grafana (PromQL) → dashboards
  │
  └── PinoLogger → pino-loki transport
                        └── Loki → Grafana (LogQL) → logs
```

- **Prometheus** — base de datos de series temporales para métricas
- **Loki** — storage de logs estructurados (JSON via pino-loki)
- **Grafana** — UI unificada que consulta ambos con PromQL y LogQL

---

## Explorar métricas (PromQL)

1. Abrir `http://localhost:3002`
2. Menú izquierdo → **Drilldown** (antes llamado Explore)
3. Seleccionar datasource: **Prometheus**
4. Escribir la query en el campo **Metric**

---

## Métricas disponibles

### `http_requests_total` — Counter

Total de requests HTTP procesados. Labels disponibles:

| Label         | Valores de ejemplo                    |
| ------------- | ------------------------------------- |
| `method`      | `GET`, `POST`, `PATCH`, `DELETE`      |
| `route`       | `/health`, `/api/v1/flashcards`, etc. |
| `status_code` | `200`, `201`, `400`, `404`, `500`     |
| `app`         | `ididntcatchthat-api`                 |

**Queries útiles:**

```promql
# Total de requests por ruta
http_requests_total

# Tasa de requests por segundo (últimos 5 min)
rate(http_requests_total[5m])

# Solo errores 5xx
rate(http_requests_total{status_code=~"5.."}[5m])

# Tasa de errores 4xx por ruta
rate(http_requests_total{status_code=~"4..", route!="/metrics"}[5m])
```

---

### `http_request_duration_seconds` — Histogram

Duración de cada request en segundos. Permite calcular percentiles reales.

**Queries útiles:**

```promql
# Latencia mediana (p50)
histogram_quantile(0.5, rate(http_request_duration_seconds_bucket[5m]))

# Latencia p95 — el 95% de requests tarda menos que esto
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Latencia p99 — los peores requests
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Latencia p95 filtrada por ruta
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{route="/api/v1/games"}[5m]))
```

---

### Métricas de Node.js (automáticas via prom-client)

| Métrica                         | Qué mide                              |
| ------------------------------- | ------------------------------------- |
| `nodejs_heap_size_used_bytes`   | Memoria heap usada                    |
| `nodejs_heap_size_total_bytes`  | Memoria heap total                    |
| `nodejs_event_loop_lag_seconds` | Lag del event loop — señal de bloqueo |
| `nodejs_active_handles_total`   | Handles activos (conexiones, timers)  |
| `process_cpu_seconds_total`     | CPU consumido por el proceso          |

**Queries útiles:**

```promql
# Memoria heap en MB
nodejs_heap_size_used_bytes / 1024 / 1024

# Lag del event loop en ms (>100ms es preocupante)
nodejs_event_loop_lag_seconds * 1000
```

---

## Explorar logs (LogQL)

1. Menú izquierdo → **Drilldown**
2. Seleccionar datasource: **Loki**
3. Escribir la query en el campo **Log query**

Los logs llegan via `pino-loki` — JSON estructurado con los labels `app` y `env`.

### Queries útiles

```logql
# Todos los logs de la API
{app="ididntcatchthat-api"}

# Solo errores
{app="ididntcatchthat-api"} | json | level = "error"

# Solo warnings y errores
{app="ididntcatchthat-api"} | json | level =~ "warn|error"

# Buscar texto libre
{app="ididntcatchthat-api"} |= "API started"

# Logs de prod
{app="ididntcatchthat-api", env="production"}

# Logs con contexto de un port concreto
{app="ididntcatchthat-api"} | json | line_format "{{.level}} — {{.msg}}"
```

### Labels disponibles en Loki

| Label | Valores |
| ----- | ------- |
| `app` | `ididntcatchthat-api` |
| `env` | `development` \| `production` |

---

## Métricas clave para este proyecto

### Rendimiento general

- **p95 latencia** — los usuarios perciben lentitud si supera 300ms
- **Tasa de errores 5xx** — cualquier valor > 0 en prod es una alerta
- **Event loop lag** — si sube, la API está bloqueada procesando algo pesado

### Endpoints críticos

| Endpoint                              | Por qué importa                             |
| ------------------------------------- | ------------------------------------------- |
| `POST /api/v1/games`                  | Inicio de sesión de juego — alta frecuencia |
| `POST /api/v1/attempts`               | Registro de intentos — el más llamado       |
| `POST /api/v1/pronunciation/evaluate` | Llama a Azure Speech — latencia externa     |
| `GET /api/v1/flashcards`              | Carga del catálogo — puede crecer mucho     |

```promql
# Latencia p95 solo en endpoints críticos
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{
    route=~"/api/v1/games|/api/v1/attempts|/api/v1/pronunciation.*"
  }[5m])
)
```

### Audio (ElevenLabs)

Cuando implementemos el pipeline de audio, añadir métricas custom para:

- Tiempo de generación de audio por flashcard
- Tasa de fallos en ElevenLabs

### Spaced repetition

- Volumen de `attempts` por minuto — pico durante sesiones de estudio
- Distribución de scores de pronunciación — señal de dificultad del contenido

---

## Alertas recomendadas (configurar en Grafana Alerting)

| Alerta               | Query                                                                      | Umbral  | Severidad   |
| -------------------- | -------------------------------------------------------------------------- | ------- | ----------- |
| Errores 5xx          | `rate(http_requests_total{status_code=~"5.."}[5m])`                        | > 0     | 🔴 Critical |
| Latencia p99 alta    | `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` | > 1s    | 🟡 Warning  |
| Latencia p99 crítica | `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` | > 3s    | 🔴 Critical |
| Heap memory alta     | `nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes`               | > 0.85  | 🟡 Warning  |
| Event loop lag       | `nodejs_event_loop_lag_seconds * 1000`                                     | > 100ms | 🟡 Warning  |
