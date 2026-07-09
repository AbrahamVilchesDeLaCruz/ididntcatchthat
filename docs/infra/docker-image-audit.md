# Docker image security audit

Inventario de imágenes del stack, política de versionado y escaneo con Trivy.

---

## Inventario

| Imagen | Uso | Tag / versión | Escaneo CI |
|--------|-----|---------------|------------|
| `node:24-alpine` | API runtime base | major pin | vía build API |
| `nginx:1.27-alpine` | Client runtime | semver pin | vía build client |
| `rabbitmq:4.1-management-alpine` | Compose base (local/dev tooling) | minor pin | CI infra job |
| `rabbitmq:4.1-alpine` | CI / test | minor pin | CI infra job |
| `prom/prometheus` | Observabilidad | `v3.13.0` | CI infra job |
| `grafana/grafana` | Observabilidad | `12.4.5-ubuntu` | CI infra job (OS packages) |
| `grafana/loki` | Observabilidad | `3.6.12` | CI infra job |
| `postgres:16-alpine` | Local / test | major pin | no (efímero) |
| `minio/minio` | Local only | release tag | no |

---

## Política de pinning

1. **Imágenes de aplicación:** tags semver o digest en Dockerfiles (`nginx:1.27-alpine`, no `nginx:alpine`).
2. **Infra en compose:** versión explícita (`grafana/grafana:12.4.5-ubuntu`, no `latest`).
3. **Actualizaciones:** revisar Trivy en CI antes de bump; documentar en PR si hay CVE resuelto.

---

## Escaneo local

Requisitos: Docker + [Trivy](https://trivy.dev/) (`brew install trivy`).

```bash
# Solo imágenes de infra (pull + scan)
make security-scan-images

# Incluir imágenes custom api/client
SCAN_CUSTOM=true make security-scan-images
```

Equivalente manual:

```bash
bash infra/scripts/security/scan-images.sh
```

Parámetros Trivy en CI y local: `CRITICAL,HIGH`, `ignore-unfixed: true` (ver [ADR-029](../adr/029-trivy-vulnerability-scanning.md)).

Grafana se escanea con `vuln-type: os` en CI: usamos la variante Ubuntu `12.4.5-ubuntu` porque Alpine `12.4.5` acumula CVEs OS en libcurl sin imagen parcheada; los binarios embebidos (Tempo/Prometheus) siguen arrastrando CVEs upstream que no podemos parchear en nuestra imagen.

---

## Cadencia de revisión

| Cuándo | Acción |
|--------|--------|
| Cada PR que toque `infra/` o Dockerfiles | CI Trivy automático |
| Tras incidente de seguridad / CVE público | `make security-scan-images` en local |
| Trimestral | Revisar bumps de imágenes base (node, nginx, rabbitmq, grafana stack) |

---

## Referencias

- [vps-security.md](../vps-security.md) — hardening del host y puertos
- [ADR-029](../adr/029-trivy-vulnerability-scanning.md) — Trivy en CI
- [ADR-030](../adr/030-docker-port-binding-policy.md) — binding de puertos Docker en VPS
