# VPS Security Hardening

Checklist de seguridad aplicada al VPS (prod + dev).  
Revisar en cada nuevo servidor y tras incidentes de red.

---

## Comandos rápidos (`make security-*`)

Ejecutar desde la raíz del repo en el VPS (`/opt/ididntcatchthat` o `/opt/ididntcatchthat-dev`):

| Comando | Cuándo |
|---------|--------|
| `make security-audit` | Auditoría completa (puertos + RabbitMQ + SSH) |
| `make security-audit-ports` | Solo puertos / Docker / UFW / iptables |
| `make security-audit-rabbitmq` | Logs + `rabbitmqctl` (`STACK=dev` opcional) |
| `make security-audit-ssh` | fail2ban + auth.log |
| `make security-probe-external` | Probe `nc` contra IP pública |
| `make security-verify` | Tras deploy — audit + probe (exit 1 si leak) |
| `make security-hotfix-iptables` | Hotfix temporal DOCKER-USER (confirmación) |
| `make security-scan-images` | Trivy local sobre imágenes de infra |
| `make security-rotate-rabbitmq` | Rotar `RABBITMQ_PASS` (`ROTATE_CONFIRM=yes`) |

Scripts en [`infra/scripts/security/`](../infra/scripts/security/).

---

## Firewall — UFW

### Configuración aplicada

Solo 3 puertos abiertos al exterior vía UFW:

| Puerto | Protocolo | Motivo                            |
| ------ | --------- | --------------------------------- |
| 22     | TCP       | SSH                               |
| 80     | TCP       | HTTP (redirige a HTTPS via nginx) |
| 443    | TCP       | HTTPS                             |

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

### Docker bypass de UFW (crítico)

**UFW solo no basta.** Docker publica puertos en `0.0.0.0` insertando reglas en la cadena `DOCKER` de iptables que aceptan tráfico **antes** de UFW.

Síntoma observado (2026-07-06): probes AMQP desde IPs externas al puerto 5672 del stack dev aunque UFW solo permitía 22/80/443.

**Mitigación permanente:** ver [ADR-030](adr/030-docker-port-binding-policy.md) — servicios internos sin `ports` o bound a `127.0.0.1`.

**Mitigación temporal (hotfix):**

```bash
make security-hotfix-iptables
# o manualmente:
sudo apt install -y iptables-persistent
sudo iptables -I DOCKER-USER -i eth0 -p tcp -m multiport --dports 5672,15672,9090,3002,3100 -j DROP
sudo netfilter-persistent save
```

**Defensa sostenible (opcional):** [ufw-docker](https://github.com/chaifeng/ufw-docker) — integra UFW con reglas Docker sin mantener `DOCKER-USER` a mano.

---

## Binding de puertos por entorno

| Servicio | Prod VPS | Dev VPS | Local / CI |
|----------|----------|---------|------------|
| API | `127.0.0.1:3000` → nginx | `127.0.0.1:3001` → nginx | Docker / host |
| Client | `127.0.0.1:4000` → nginx | `127.0.0.1:4001` → nginx | Docker / Vite |
| RabbitMQ | sin `ports` (red Docker) | sin `ports` | local: `:5674`, dev-host: `127.0.0.1:5672` |
| Prometheus / Grafana / Loki | `127.0.0.1` + SSH tunnel | `127.0.0.1` + `make tunnel-dev` | dev local |

Los containers de aplicación solo son accesibles vía **nginx** (dominios HTTPS). Observabilidad vía **SSH tunnel** (`make tunnel-prod` / `make tunnel-dev`).

---

## Incident response — RabbitMQ AMQP expuesto

Si aparecen logs como:

```text
accepting AMQP connection <IP-externa> -> ...:5672
closing AMQP ... RabbitMQ requires SASL security layer
```

### 1. Auditoría (no asumir que “rechazado” = limpio)

```bash
make security-audit
```

Revisar manualmente:

- Historial **completo** de logs (no `tail -50`).
- `rabbitmqctl list_users`, `list_permissions`, `list_queues`.
- Líneas con `successfully authenticated`, `guest`, colas anómalas.

### Riesgo guest + docker-proxy

Con `ports: "5672:5672"`, el tráfico entra por docker-proxy. RabbitMQ puede ver la conexión como red Docker interna (`172.x.x.x`), no como IP externa — la protección anti-`guest` remoto puede fallar de forma no obvia.

### 2. Rotar credenciales (P1)

```bash
ROTATE_CONFIRM=yes make security-rotate-rabbitmq
make deploy-dev   # o deploy-prod según entorno
```

### 3. Fix permanente + verificación

```bash
git pull && make deploy-dev
make security-verify
```

Ventana de exposición conocida: `5672:5672` en dev compose desde PR #34 (`65a2ff8`).

---

## SSH — Clave pública + fail2ban

Se mantiene `PasswordAuthentication` como **acceso de emergencia**. fail2ban mitiga fuerza bruta.

```bash
make security-audit-ssh
# o manualmente:
sudo systemctl status fail2ban
sudo fail2ban-client status sshd
grep -iE 'Failed password|Invalid user' /var/log/auth.log | tail -30
```

### Clave pública

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@<VPS_IP>
```

### PermitRootLogin deshabilitado

```bash
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sshd -t && sudo systemctl restart ssh
```

---

## Qué NO debe estar expuesto a internet

| Servicio    | Puerto | Estado esperado post-hardening      |
| ----------- | ------ | ----------------------------------- |
| PostgreSQL  | 5432   | No publicado en VPS (Aiven remoto)  |
| RabbitMQ    | 5672   | Solo red Docker o 127.0.0.1 local   |
| RabbitMQ UI | 15672  | Solo 127.0.0.1 o sin publish        |
| Prometheus  | 9090   | 127.0.0.1 + SSH tunnel              |
| Grafana     | 3002   | 127.0.0.1 + SSH tunnel              |
| Loki        | 3100   | 127.0.0.1 + SSH tunnel              |
| API / client| 3000–4001 | 127.0.0.1 — nginx como única entrada pública |

Verificación externa:

```bash
make security-probe-external
# nc -zv $(curl -s ifconfig.me) 5672  # debe fallar
```

---

## Auditoría de imágenes Docker

Ver [infra/docker-image-audit.md](infra/docker-image-audit.md). Resumen:

```bash
make security-scan-images
```

CI escanea imágenes api/client + infra (Trivy, CRITICAL/HIGH).

---

## OWASP Top 10 — mitigaciones aplicadas

| Riesgo                                         | Mitigación                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| A05 Security Misconfiguration                  | UFW + binding 127.0.0.1, nginx único entrypoint, ADR-030             |
| A02 Cryptographic Failures                     | HTTPS via Certbot + Let's Encrypt                                    |
| A07 Identification and Authentication Failures | SSH keys, fail2ban, rotación RabbitMQ tras exposición                |
| Secrets exposure                               | Doppler — nunca en repo ni `.env` commiteados                        |

---

## Checklist para nuevo servidor

- [ ] UFW activo con solo 22, 80, 443
- [ ] Compose sin `0.0.0.0` en servicios internos (ADR-030)
- [ ] `make security-verify` pasa tras deploy
- [ ] Clave pública en `~/.ssh/authorized_keys`
- [ ] `PermitRootLogin no`
- [ ] fail2ban activo (`make security-audit-ssh`)
- [ ] Certbot + dominios nginx
- [ ] Doppler service tokens
- [ ] PostgreSQL NO en Docker en VPS (Aiven)

---

## Referencias

- [ADR-030](adr/030-docker-port-binding-policy.md) — política de puertos Docker
- [docker-image-audit.md](infra/docker-image-audit.md) — inventario y Trivy
- [deployment.md](deployment.md) — deploy VPS
