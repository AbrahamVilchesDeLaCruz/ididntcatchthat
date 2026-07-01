# Diagrama: Backoffice Observability — Flujo de datos

> Muestra el flujo completo desde las fuentes de datos (Prometheus + PostgreSQL) hasta los cuatro tabs de la UI del backoffice con la capa InsightCard.

---

## Flujo completo

```mermaid
flowchart LR
    subgraph sources [Fuentes de datos]
        prometheus["prom-client\n(in-memory Registry)"]
        db["PostgreSQL\n(tabla users)"]
    end

    subgraph instrumentation [Instrumentación API]
        collectDefault["collectDefaultMetrics()\nnodejs_* / process_*"]
        interceptor["MetricsInterceptor\nhttp_requests_total\nhttp_request_duration_seconds"]
        appMetrics["PrometheusAppMetrics\napp_games_* / app_flashcards_*\napp_audio_* / app_auth_*"]
    end

    subgraph api [API — NestJS]
        metricsEndpoint["GET /v1/metrics/summary\n(snapshot JSON envelope)"]
        userStatsEndpoint["GET /admin/users/stats\n(DB query)"]
        userStatsUC["UserStatsRetriever\n(QueryBuilder sobre users)"]
    end

    subgraph frontend [Backoffice UI — BackofficeObservabilityContainer]
        tabHTTP["Tab HTTP\nKPI cards + breakdown table\np95 por ruta"]
        tabRuntime["Tab Runtime\nheap / event loop lag\nGC pauses / uptime"]
        tabBusiness["Tab Negocio\ngames / flashcards\naudio / auth counters"]
        tabUsers["Tab Usuarios\nregistros / activos\ncanal / engagement / rachas"]
        insightCard["InsightCard\ncifra + frase contextual\n+ indicador verde/ámbar/rojo"]
    end

    collectDefault --> prometheus
    interceptor --> prometheus
    appMetrics --> prometheus
    prometheus --> metricsEndpoint

    db --> userStatsUC --> userStatsEndpoint

    metricsEndpoint -->|"refetch 30s"| tabHTTP
    metricsEndpoint -->|"refetch 30s"| tabRuntime
    metricsEndpoint -->|"refetch 30s"| tabBusiness
    userStatsEndpoint -->|"on mount"| tabUsers

    tabHTTP --> insightCard
    tabRuntime --> insightCard
    tabBusiness --> insightCard
    tabUsers --> insightCard
```

---

## Parsers del frontend por tab

```mermaid
flowchart TD
    summary["MetricsSummaryVM\n(array de MetricVM)"]

    summary --> parseHTTP["parseHttpStats()\n→ HttpStats"]
    summary --> parseLatency["parseLatencyPercentiles()\n→ LatencyPercentiles"]
    summary --> parseRuntime["parseRuntimeMetrics()\n→ RuntimeMetrics"]
    summary --> parseBusiness["parseBusinessMetrics()\n→ BusinessMetrics"]

    parseHTTP --> httpCards["HttpSummaryCards\n(total / 2xx / 4xx / 5xx / p95)"]
    parseLatency --> httpCards
    parseHTTP --> breakdownTable["HttpBreakdownTable\n(por ruta/método/status)"]

    parseRuntime --> runtimeCards["RuntimeCards\n(heap% / eventloop / GC / uptime)"]

    parseBusiness --> businessCards["BusinessCards\n(games / flashcards / audio / auth)"]

    userStats["UserStatsVM\n(de /admin/users/stats)"] --> usersCards["UsersCards\n(total / nuevos / activos / canal / rachas)"]
```

---

## Arquitectura Clean — AppMetrics port

```mermaid
flowchart LR
    subgraph domain [shared/domain]
        AppMetricsInterface["AppMetrics interface\n+ APP_METRICS Symbol"]
    end

    subgraph application [Use cases]
        GameStarter["game-starter.ts"]
        GameCompleter["game-completer.ts"]
        UserRegistrar["user-registrar.ts"]
        UserAuthenticator["user-authenticator.ts"]
        OAuthCallback["google-callback controller"]
    end

    subgraph infrastructure [shared/infrastructure]
        PrometheusAppMetrics["PrometheusAppMetrics\nimplements AppMetrics\n(inyecta METRICS_REGISTRY)"]
    end

    AppMetricsInterface -.->|"implements"| PrometheusAppMetrics
    GameStarter -->|"@Inject(APP_METRICS)"| AppMetricsInterface
    GameCompleter -->|"@Inject(APP_METRICS)"| AppMetricsInterface
    UserRegistrar -->|"@Inject(APP_METRICS)"| AppMetricsInterface
    UserAuthenticator -->|"@Inject(APP_METRICS)"| AppMetricsInterface
    OAuthCallback -->|"@Inject(APP_METRICS)"| AppMetricsInterface
```
