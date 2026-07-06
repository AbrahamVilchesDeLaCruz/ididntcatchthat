# ADR-030: Política de binding de puertos Docker en VPS

**Status**: Accepted  
**Date**: 2026-07-06  
**Deciders**: Abraham Vilches de la Cruz

---

## Context

El VPS dev publicaba RabbitMQ (`5672`, `15672`) y observabilidad (`9090`, `3100`, …) en `0.0.0.0` via [`infra/docker-compose.dev.yml`](../../infra/docker-compose.dev.yml). Docker inserta reglas iptables que **circunven UFW**, de modo que esos puertos eran alcanzables desde internet aunque UFW solo permitiera 22/80/443.

Logs del broker mostraron probes AMQP desde IPs externas (p. ej. escáneres Shodan/Censys).

---

## Decision

### Regla VPS (dev y prod)

| Tipo de servicio | Binding permitido |
|------------------|-------------------|
| API / client (detrás de nginx) | `127.0.0.1:PORT:PORT` en el host |
| RabbitMQ, Postgres, MinIO | **Sin `ports`** — solo red Docker interna |
| Prometheus, Grafana, Loki | `127.0.0.1:PORT:PORT` — acceso vía SSH tunnel |

**Único punto de entrada público:** nginx en el host (80/443).

### Excepciones

| Entorno | Puertos publicados | Motivo |
|---------|-------------------|--------|
| `docker-compose.local.yml` | Sí (máquina del desarrollador) | Stack autocontenido local |
| `docker-compose.test.yml` | Sí (runner CI efímero) | Tests E2E / API |
| `docker-compose.dev-host.yml` | RabbitMQ `127.0.0.1:5672` | `make dev` — API en host, no en Docker |

### Defensa en profundidad

1. Fix de compose (causa raíz).
2. Hotfix temporal: reglas `DOCKER-USER` + `netfilter-persistent` (`make security-hotfix-iptables`).
3. Opcional a largo plazo: [ufw-docker](https://github.com/chaifeng/ufw-docker).

---

## Incident response (AMQP expuesto)

1. `make security-audit` en el VPS.
2. Revisar logs completos + `rabbitmqctl list_users/queues` (no asumir limpieza por un solo probe fallido).
3. Rotar `RABBITMQ_PASS`: `ROTATE_CONFIRM=yes make security-rotate-rabbitmq`.
4. Aplicar fix compose + `make deploy-dev` + `make security-verify`.

---

## Consequences

**Positivas:** Superficie de ataque alineada con prod; UFW + documentación coherentes; scripts `make security-*` repetibles.

**Negativas:** Observabilidad dev requiere SSH tunnel (ya existía para prod). `make dev` local necesita compose overlay `dev-host.yml`.

---

## References

- [vps-security.md](../vps-security.md)
- [docker-image-audit.md](../infra/docker-image-audit.md)
- [ADR-006](006-vps.md) — VPS propia
- [ADR-016](016-environments-strategy.md) — entornos
