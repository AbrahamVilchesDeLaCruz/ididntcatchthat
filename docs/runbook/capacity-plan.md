# Capacity Plan — ididntcatchthat

> Métricas observadas, esperadas y plan de escalado. **Honestidad:** la mayoría son estimaciones — no hay telemetría histórica suficiente para claims fuertes. Lo medido va marcado con `[medido]`. Lo estimado con `[estimado]`.

---

## Quick path

1. Revisar VPS actual y tráfico esperado
2. Identificar cuellos de botella (audio, DB, RabbitMQ, APIs)
3. Monitorizar las métricas listadas tras el deploy
4. Si crece, seguir el plan de escalado por niveles

---

## Estado actual

### VPS

| Recurso | Valor | Fuente |
|---|---|---|
| vCPU | `[estimado]` 4 | [deployment.md §requisitos](./deployment.md#requisitos-del-vps) |
| RAM | `[estimado]` 8 GB | Mismo |
| Disco SSD | `[estimado]` 80 GB | Mismo |

### Tráfico esperado

| Métrica | TFM | Post-TFM (Y1, si continúa) |
|---|---|---|
| Usuarios registrados | `[estimado]` < 200 | 500–2 000 |
| DAU | `[estimado]` 10–50 | 50–300 |
| Partidas concurrentes | `[estimado]` < 5 | 10–50 |
| API reads/s | `[estimado]` 5–20 | (revisar tras deploy) |
| API writes/s | `[estimado]` 0.5–2 | (revisar tras deploy) |

El TFM no es SaaS público; el tráfico post-TFM **no es una承诺** — son rangos para dimensionar.

---

## Bottlenecks identificados

| Componente | Riesgo | Mitigación actual |
|---|---|---|
| **Audio CDN (R2 + Cloudflare)** | Bajo. Latencia de primer hit en regiones sin PoP. | Tier gratuito 10 GB sin egress; 300+ PoPs. Monitorizar `cache_hit_ratio`. |
| **PostgreSQL (Aiven)** | Medio. Free tier tiene límites de conexión/CPU. | Índices (`games`, `flashcards`, `users`); pool TypeORM 10 conexiones (ajustable a 20 vía `?pool_max=20`). Upgrade a `Business-4` (~$60/mes) si se queda corto. |
| **RabbitMQ** | Bajo. < 10 msgs/día en operación normal. | `prefetch` + retry + DLQ ([ADR-019](./adr/019-event-bus-strategy.md)) + `ELEVENLABS_MAX_CONCURRENT=3`. |
| **DeepSeek API** | Bajo. ~10 llamadas/mes, <$1/mes. | Stubs locales disponibles ([ADR-016](./adr/016-environments-strategy.md)). |
| **ElevenLabs API** | Medio. Rate limit por plan. | Concurrencia 3. Si crece → mover a job nocturno. |
| **nginx + CPU VPS** | Bajo. 100 RPS = < 5% CPU. | Sin acción necesaria. |

---

## Métricas a medir tras el deploy

| Métrica | Dónde | Qué mirar |
|---|---|---|
| `http_requests_total{status=~"5.."}` | Prometheus | Errores 5xx. > 1% = bug |
| `http_request_duration_seconds` p95 | Prometheus | Latencia. > 500ms = problema DB o servicio externo |
| `app_games_started_total` / `_completed_total` | Prometheus | Uso real y ratio de abandono |
| `app_audio_generated_total{provider="elevenlabs"}` | Prometheus | Coste operacional |
| `app_auth_logins_total{provider}` | Prometheus | Distribución email/password vs Google |
| RabbitMQ queue depth | UI (vía tunnel) | Crece sin bajar → consumer muerto |
| RabbitMQ DLQ depth | UI | > 0 → bug en subscriber |
| Disco / memoria VPS | `df -h` / `free -h` | Prom + Loki + RabbitMQ + API suman 4–5 GB |

```bash
make tunnel-prod  # SSH tunnel local
# Grafana: http://localhost:3003 | Prometheus: http://localhost:9091
```

---

## Plan de escalado

| Nivel | DAU | Trigger | Acción |
|---|---|---|---|
| 1 — actual | < 100 | p95 < 200ms, 5xx < 0.1%, mem < 70% | Ninguna |
| 2 — vertical | 100–500 | p95 > 500ms consistente, mem > 80% | VPS 8 vCPU + 16 GB (~$40–60/mes); Aiven `Business-4` (~$60/mes); rotación agresiva de logs |
| 3 — workers separados | 500–2 000 | API compite con subscribers por CPU/RAM | VPS adicional para workers; API queda sola en el original |
| 4 — réplicas API | 2 000+ | Una instancia no da abasto | Múltiples réplicas detrás de nginx (stateless — JWT no requiere sticky sessions, [ADR-018](./adr/018-auth-strategy.md)); RabbitMQ y DB compartidos |
| 5 — multi-región | 10 000+ | Latencia inaceptable desde otras regiones | Réplicas API en otras regiones; CDN cubre audio; DB: Aiven replica o CockroachDB. **Fuera del alcance del TFM y del año 1.** |

---

## Deuda que NO escalará bien

| Componente | Por qué | Mitigación futura |
|---|---|---|
| Sin Redis | Cache y rate limit en memoria del proceso | Añadir Redis cuando haya > 1 réplica |
| HTML del client servido por VPS | Nginx en VPS, no en CDN | Mover a Cloudflare Pages o Vercel |
| Logs en disco del VPS | Loki retiene según espacio | Rotación agresiva o servicio externo |
| 1 connection pool por instancia | 3 réplicas = 3 pools | PgBouncer o Aiven pooler |

---

## Hipótesis a validar con métricas reales

1. `[estimado]` DAU post-lanzamiento < 100 durante los primeros 3 meses.
2. `[estimado]` El audio CDN cachea > 95% de hits.
3. `[estimado]` Los teachers crean < 100 flashcards/mes.
4. `[estimado]` RabbitMQ no acumula > 10 mensajes en la cola principal.
5. `[estimado]` El VPS con 8 GB RAM tiene > 2 GB libre en operación normal.

Cuando haya telemetría real, este doc se actualiza.

---

## Referencias

- [deployment.md](./deployment.md) · [ADR-006 — VPS](./adr/006-vps.md) · [ADR-016 — Entornos](./adr/016-environments-strategy.md)
- [ADR-018 — Auth](./adr/018-auth-strategy.md) — stateless · [ADR-019 — Event bus](./adr/019-event-bus-strategy.md)
- [ADR-020 — Observabilidad](./adr/020-observability-strategy.md)
- [first-deploy.md](./runbook/first-deploy.md) — qué monitorizar tras el deploy