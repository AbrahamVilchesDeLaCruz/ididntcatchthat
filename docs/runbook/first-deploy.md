# Runbook — Primer deploy a VPS

> Cómo llevar ididntcatchthat de "VPS Ubuntu nuevo" a "app en producción con HTTPS". Asume un VPS con IP pública y SSH como `ubuntu`. Para deploys sucesivos: `make vps-deploy-prod` directamente.

---

## Quick path

1. Prerrequisitos
2. Setup (deps + repo + Doppler + nginx + Certbot + UFW)
3. Deploy (`make vps-deploy-prod`)
4. Smoke tests
5. Hardening (`make security-verify`)

Tiempo estimado: 1.5–2 horas.

---

## 1. Prerrequisitos

**VPS:** Ubuntu 22.04+ LTS, 4 vCPU + 8 GB RAM mínimo, IP pública estática. SSH con clave pública del operador.

**DNS** (configurar antes de continuar):

```bash
# Proveedor DNS → registros A para @, www, api, dev, api.dev → <IP_VPS>
dig +short api.ididntcatchthat.com A  # verificar propagación
```

**Doppler:** cuenta con proyecto `ididntcatchthat`, configs `prd` y `dev` pobladas. Ver [ADR-017](./adr/017-secrets-doppler.md).

---

## 2. Setup inicial

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx ufw fail2ban
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu   # logout/login
(curl -Ls --tls-v1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sudo sh

sudo mkdir -p /opt/ididntcatchthat /opt/ididntcatchthat-dev
sudo chown -R ubuntu:ubuntu /opt/ididntcatchthat /opt/ididntcatchthat-dev
git clone https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat.git /opt/ididntcatchthat
git clone https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat.git /opt/ididntcatchthat-dev
```

**Doppler Service Tokens** — generar en dashboard.doppler.com:

```bash
doppler setup --token <TOKEN_PRD> --project ididntcatchthat --config prd --no-interactive --scope /opt/ididntcatchthat
doppler setup --token <TOKEN_DEV> --project ididntcatchthat --config dev --no-interactive --scope /opt/ididntcatchthat-dev
```

**nginx + Certbot + UFW:**

```bash
cd /opt/ididntcatchthat && make nginx-setup

sudo certbot --nginx \
  -d ididntcatchthat.com -d www.ididntcatchthat.com -d api.ididntcatchthat.com \
  -d dev.ididntcatchthat.com -d api.dev.ididntcatchthat.com
sudo certbot renew --dry-run

sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw --force enable
```

**SSH hardening:**

```bash
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sshd -t && sudo systemctl restart ssh
```

> UFW **no** basta con Docker — servicios internos deben ir bound a `127.0.0.1` ([ADR-030](./adr/030-docker-port-binding-policy.md)).

---

## 3. Deploy

```bash
cd /opt/ididntcatchthat
make vps-deploy-prod   # git pull + docker compose up -d --build (5-15 min)

make vps-ps-prod
docker logs ididntcatchthat-api-prod | tail -50
curl -i http://127.0.0.1:3000/health                  # 200 esperado
curl -i https://api.ididntcatchthat.com/v1/health      # 200 desde internet
```

---

## 4. Smoke tests

```bash
# HTTPS
curl -fsSL https://ididntcatchthat.com -o /dev/null -w "%{http_code}\n"  # 200

# Auth (usuario demo)
curl -X POST https://api.ididntcatchthat.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ididntcatchthat.com","password":"DemoProd123!"}' \
  -c /tmp/cookies.txt -w "\nHTTP %{http_code}\n"  # 201

# Audio desde R2 (URL debe empezar con https://pub-...r2.dev)
curl -fsSL https://api.ididntcatchthat.com/v1/flashcards/search \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0].audioUs'
curl -I <URL_AUDIO>  # 200 + content-type: audio/mpeg

# Google OAuth (navegador): click → callback sin 404
# Si 404, ver troubleshooting en deployment.md

# RabbitMQ: crear flashcard con admin token, esperar 60-120s, verificar audio en R2
curl -X POST https://api.ididntcatchthat.com/v1/backoffice/flashcards \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"expression":"test","meaning":"test","category":"connected-speech","subcategory":"linking"}'
# Si no aparece audio: make security-audit-rabbitmq
```

---

## 5. Hardening post-deploy

```bash
make security-verify
# Esperado: solo 22, 80, 443 abiertos; 5432/5672/9090/3002/3100 cerrados
```

Si reporta puertos expuestos: **no ignorar**. Aplicar [ADR-030](./adr/030-docker-port-binding-policy.md) y re-verificar. El incidente RabbitMQ AMQP ([retrospective.md](./retrospective.md)) empezó así.

```bash
# Backup DB
doppler run --config prd -- bash -c 'pg_dump "$DATABASE_URL" > /tmp/backup-$(date +%F).sql'
# Guardar fuera del VPS. No commitear.
```

---

## Rollback plan

**Código:**

```bash
cd /opt/ididntcatchthat
git log --oneline -5
git reset --hard <commit-anterior-funcional>
make vps-deploy-prod
```

**Imagen Docker:**

```bash
docker images | grep ididntcatchthat-api
docker tag ididntcatchthat-api:<tag-anterior> ididntcatchthat-api:rollback
# IMAGE_TAG=rollback en .env y redeploy
```

**Migración** (no automatizado): conectar a Aiven con `DATABASE_CA_CERT`, `psql $DATABASE_URL`, ejecutar el `down` de la migration problemática, commit revert + redeploy.

---

## Monitoreo continuo (primeras 2 semanas)

| Qué | Cómo | Frecuencia |
|---|---|---|
| Errores 5xx | `make vps-logs-prod` + filtro `level=error` | Diaria |
| Métricas HTTP | `make tunnel-prod` + Prometheus | Diaria |
| Disco VPS | `df -h` | Diaria |
| Renovación Certbot | `sudo certbot renew --dry-run` | Mensual |
| Trivy scan | `make security-scan-images` | Semanal |
| Backup DB | Ver sección 5 | Semanal |

---

## Referencias

- [ADR-016 — Entornos](./adr/016-environments-strategy.md) · [ADR-017 — Doppler](./adr/017-secrets-doppler.md)
- [ADR-030 — Docker port binding](./adr/030-docker-port-binding-policy.md)
- [deployment.md](./deployment.md) — guía completa · [vps-security.md](./vps-security.md) — hardening
- [capacity-plan.md](./runbook/capacity-plan.md) — métricas post-deploy