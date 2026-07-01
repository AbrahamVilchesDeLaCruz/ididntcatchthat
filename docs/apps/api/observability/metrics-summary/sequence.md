# Metrics Summary — Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor A as Admin
    participant C as SearchMetricsSummaryGetController
    participant UC as MetricsSummaryRetriever
    participant Q as PrometheusMetricsSummaryQuery
    participant R as prom-client Registry

    A->>C: GET /v1/metrics/summary
    Note over C: JwtAuthGuard + RolesGuard (admin)

    alt no admin
        C-->>A: 403
    end

    C->>UC: execute()
    UC->>Q: collect()
    Q->>R: getMetricsAsJSON() / metric snapshots
    R-->>Q: http_*, app_*, nodejs_*
    Q-->>UC: MetricsSummary
    UC-->>C: MetricsSummary
    C-->>A: 200 envelope
```

## Scrape Prometheus (relacionado)

```mermaid
sequenceDiagram
    actor P as Prometheus
    participant C as MetricsGetController
    participant R as Registry

    P->>C: GET /metrics
    Note over C: Sin auth, sin prefijo v1
    C->>R: metrics()
    R-->>C: text exposition
    C-->>P: 200 text/plain
```

## Instrumentación automática

Cada request HTTP pasa por `MetricsInterceptor` → incrementa `http_requests_total` y `http_request_duration_seconds`.
