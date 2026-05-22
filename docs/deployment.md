# Deployment Guide

Guía completa para desplegar **ididntcatchthat** en un VPS con nginx, Docker y HTTPS gratuito via Let's Encrypt.

---

## Arquitectura

```
Internet
   │
   ▼
nginx (host) — puerto 80/443
   │
   ├── ididntcatchthat.com         → client prod  (container :4000)
   ├── api.ididntcatchthat.com     → api prod      (container :3000)
   ├── dev.ididntcatchthat.com     → client dev    (container :4001)
   └── api.dev.ididntcatchthat.com → api dev       (container :3001)
```

nginx actúa como **reverse proxy** en el host. Los containers nunca exponen los puertos 80/443 directamente — todo pasa por nginx.

---

## Requisitos del VPS

| Componente     | Versión mínima           |
| -------------- | ------------------------ |
| OS             | Ubuntu 22.04+            |
| nginx          | 1.18+                    |
| Docker         | 24+                      |
| Docker Compose | v2+                      |
| Doppler CLI    | 3.x                      |
| Certbot        | instalado via snap o apt |

---

## Estructura de directorios en el VPS

```
/opt/ididntcatchthat/       ← entorno prod  (config doppler: prd)
/opt/ididntcatchthat-dev/   ← entorno dev   (config doppler: dev)

/etc/nginx/sites-available/
  ├── ididntcatchthat.com
  ├── api.ididntcatchthat.com
  ├── dev.ididntcatchthat.com
  └── api.dev.ididntcatchthat.com

/etc/letsencrypt/live/ididntcatchthat.com/   ← certificados SSL (wildcard)
```

---

## Primera vez — Setup completo

### 1. DNS (Namecheap)

Configurar en **Advanced DNS** del dominio:

| Type     | Host      | Value      |
| -------- | --------- | ---------- |
| A Record | `@`       | `<VPS_IP>` |
| A Record | `www`     | `<VPS_IP>` |
| A Record | `api`     | `<VPS_IP>` |
| A Record | `dev`     | `<VPS_IP>` |
| A Record | `api.dev` | `<VPS_IP>` |

Verificar propagación antes de continuar:

```bash
dig +short ididntcatchthat.com A
dig +short api.ididntcatchthat.com A
dig +short dev.ididntcatchthat.com A
dig +short api.dev.ididntcatchthat.com A
```

### 2. Instalar Doppler en el VPS

```bash
(curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sudo sh
doppler --version
```

### 3. Crear directorios y clonar el repo

```bash
# Prod
sudo mkdir -p /opt/ididntcatchthat
sudo chown ubuntu:ubuntu /opt/ididntcatchthat
git clone https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat.git /opt/ididntcatchthat

# Dev
sudo mkdir -p /opt/ididntcatchthat-dev
sudo chown ubuntu:ubuntu /opt/ididntcatchthat-dev
git clone https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat.git /opt/ididntcatchthat-dev
```

### 4. Configurar Doppler Service Tokens

Generar tokens en [dashboard.doppler.com](https://dashboard.doppler.com):

- Proyecto `ididntcatchthat` → config `prd` → Access → Service Tokens → nombre: `vps-prod`
- Proyecto `ididntcatchthat` → config `dev` → Access → Service Tokens → nombre: `vps-dev`

```bash
# Configurar prod
doppler setup \
  --token <TOKEN_PRD> \
  --project ididntcatchthat \
  --config prd \
  --no-interactive \
  --scope /opt/ididntcatchthat

# Configurar dev
doppler setup \
  --token <TOKEN_DEV> \
  --project ididntcatchthat \
  --config dev \
  --no-interactive \
  --scope /opt/ididntcatchthat-dev
```

### 5. Configurar nginx (HTTP primero)

```bash
# Prod client
sudo tee /etc/nginx/sites-available/ididntcatchthat.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name ididntcatchthat.com www.ididntcatchthat.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Prod API
sudo tee /etc/nginx/sites-available/api.ididntcatchthat.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.ididntcatchthat.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Dev client
sudo tee /etc/nginx/sites-available/dev.ididntcatchthat.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name dev.ididntcatchthat.com;

    location / {
        proxy_pass http://localhost:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Dev API
sudo tee /etc/nginx/sites-available/api.dev.ididntcatchthat.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.dev.ididntcatchthat.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Activar sites
sudo ln -s /etc/nginx/sites-available/ididntcatchthat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.ididntcatchthat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/dev.ididntcatchthat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.dev.ididntcatchthat.com /etc/nginx/sites-enabled/

sudo nginx -t && sudo systemctl reload nginx
```

### 6. HTTPS con Certbot

```bash
sudo certbot --nginx \
  -d ididntcatchthat.com \
  -d www.ididntcatchthat.com \
  -d api.ididntcatchthat.com \
  -d dev.ididntcatchthat.com \
  -d api.dev.ididntcatchthat.com
```

Certbot modifica automáticamente los sites de nginx para SSL y configura la renovación automática.

Verificar renovación automática:

```bash
sudo certbot renew --dry-run
```

---

## Deploy prod

```bash
# Desde /opt/ididntcatchthat
make deploy-prod
```

Esto ejecuta internamente:

1. `git pull origin main`
2. Build de imágenes Docker con Doppler (config: prd)
3. Recrear containers

---

## Deploy dev

```bash
# Desde /opt/ididntcatchthat-dev
make deploy-dev
```

Esto ejecuta internamente:

1. `git pull origin dev`
2. Build de imágenes Docker con Doppler (config: dev)
3. Recrear containers

---

## Acceso a observabilidad (Prometheus + Grafana)

Prometheus y Grafana corren en el VPS pero **no están expuestos públicamente** — correcto por seguridad. Para acceder desde tu máquina local usás un SSH tunnel.

### ¿Qué es el SSH tunnel?

SSH abre un "tubo" encriptado entre un puerto de tu máquina local y un puerto del VPS. Grafana sigue corriendo en el VPS — vos simplemente lo alcanzás a través del tunnel como si fuera local.

### Abrir tunnel

```bash
# Dev — Prometheus en :9090, Grafana en :3002
make tunnel-dev

# Prod — Prometheus en :9091, Grafana en :3003 (puertos distintos para no colisionar)
make tunnel-prod
```

`VPS_HOST` se lee automáticamente desde Doppler (`ubuntu@<IP>`). Añadirla en Doppler config `dev` y `prd` antes de usar estos targets.

Mientras el tunnel está abierto:

| Servicio   | Dev                   | Prod                  |
| ---------- | --------------------- | --------------------- |
| Prometheus | http://localhost:9090 | http://localhost:9091 |
| Grafana    | http://localhost:3002 | http://localhost:3003 |
| Loki (health) | http://localhost:3100/ready | http://localhost:3101/ready |

Cerrás el tunnel con `Ctrl+C`.

---

```bash
# Ver estado de containers prod
make vps-ps-prod

# Ver logs prod
make vps-logs-prod

# Ver logs dev
make vps-logs-dev

# Reiniciar prod
make vps-restart-prod

# Reiniciar dev
make vps-restart-dev
```

---

## Actualizar repo privado (cuando aplique)

Cuando el repo pase a privado, configurar una **Deploy Key** en lugar de HTTPS:

```bash
# En el VPS — generar clave específica para este repo
ssh-keygen -t ed25519 -C "deploy@ididntcatchthat" -f ~/.ssh/ididntcatchthat_deploy -N ""
cat ~/.ssh/ididntcatchthat_deploy.pub
```

Añadir la clave pública en GitHub → Settings del repo → Deploy keys → Add deploy key (solo lectura).

```bash
# Configurar SSH para usar esta clave con GitHub
cat >> ~/.ssh/config <<'EOF'
Host github-ididntcatchthat
    HostName github.com
    User git
    IdentityFile ~/.ssh/ididntcatchthat_deploy
EOF

# Actualizar remote en ambos directorios
cd /opt/ididntcatchthat
git remote set-url origin git@github-ididntcatchthat:AbrahamVilchesDeLaCruz/ididntcatchthat.git

cd /opt/ididntcatchthat-dev
git remote set-url origin git@github-ididntcatchthat:AbrahamVilchesDeLaCruz/ididntcatchthat.git
```

---

## Variables de entorno requeridas

Gestionadas por **Doppler**. Ver variables requeridas por entorno:

```bash
# Ver variables del entorno prod
doppler secrets --project ididntcatchthat --config prd

# Ver variables del entorno dev
doppler secrets --project ididntcatchthat --config dev
```

Variables mínimas requeridas:

| Variable            | Descripción                                          |
| ------------------- | ---------------------------------------------------- |
| `NODE_ENV`          | `production` o `development`                         |
| `PORT`              | Puerto interno de la API (3000)                      |
| `DATABASE_URL`      | Connection string PostgreSQL                         |
| `GRAFANA_PASSWORD`  | Password del admin de Grafana — valor fuerte en prod |
| `VPS_HOST`          | `ubuntu@<IP>` — usado por `make tunnel-*`            |

---

## Troubleshooting

### nginx no arranca

```bash
sudo nginx -t          # verificar sintaxis
sudo journalctl -u nginx --no-pager -n 50
```

### Container no levanta

```bash
docker ps -a           # ver containers caídos
docker logs <nombre>   # ver por qué falló
```

### Certbot no renueva

```bash
sudo certbot renew --dry-run
sudo journalctl -u certbot --no-pager
```

### Ver qué ocupa los puertos

```bash
sudo ss -tlnp | grep -E '3000|3001|4000|4001|80|443'
```
