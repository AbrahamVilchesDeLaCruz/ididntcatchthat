# VPS Security Hardening

Checklist de seguridad aplicada al VPS de producción.  
Revisar este documento en cada nuevo servidor que se provisione.

---

## Firewall — UFW

### Configuración aplicada

Solo 3 puertos abiertos al exterior:

| Puerto | Protocolo | Motivo                            |
| ------ | --------- | --------------------------------- |
| 22     | TCP       | SSH                               |
| 80     | TCP       | HTTP (redirige a HTTPS via nginx) |
| 443    | TCP       | HTTPS                             |

**Todo lo demás está bloqueado** — incluyendo 5432 (PostgreSQL), 3000-3001 (API), 4000-4001 (client).

### Comandos aplicados

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Verificar estado

```bash
sudo ufw status verbose
```

Output esperado:

```
Status: active
Default: deny (incoming), allow (outgoing), deny (routed)

To                    Action    From
--                    ------    ----
22/tcp                ALLOW IN  Anywhere
80/tcp                ALLOW IN  Anywhere
443/tcp               ALLOW IN  Anywhere
```

---

## SSH — Clave pública + fail2ban

### Decisión

Se mantiene `PasswordAuthentication` activo intencionalmente como **acceso de emergencia** (pérdida del ordenador, etc). La protección contra fuerza bruta la provee **fail2ban** en lugar de deshabilitar passwords.

> En Ubuntu 25.04, `UsePAM yes` sobreescribe `PasswordAuthentication no` — deshabilitar PAM rompe otros servicios del sistema. La combinación clave SSH + fail2ban es equivalente en seguridad práctica.

### Clave pública configurada

```bash
# Desde el Mac — sube la clave pública al servidor (pide password una última vez)
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@<VPS_IP>

# Verificar que está cargada en el servidor
cat ~/.ssh/authorized_keys
```

### fail2ban — protección contra fuerza bruta

Bloquea automáticamente una IP tras X intentos fallidos de SSH.

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

Verificar estado:

```bash
sudo systemctl status fail2ban
```

Ver IPs baneadas:

```bash
sudo fail2ban-client status sshd
```

### PermitRootLogin deshabilitado

```bash
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sshd -t
sudo systemctl restart ssh
```

Verificar:

```bash
sudo grep "PermitRootLogin" /etc/ssh/sshd_config
# PermitRootLogin no
```

---

## Qué NO debe estar expuesto a internet

| Servicio    | Puerto | Estado               |
| ----------- | ------ | -------------------- |
| PostgreSQL  | 5432   | ✅ bloqueado por UFW |
| API prod    | 3000   | ✅ bloqueado por UFW |
| API dev     | 3001   | ✅ bloqueado por UFW |
| Client prod | 4000   | ✅ bloqueado por UFW |
| Client dev  | 4001   | ✅ bloqueado por UFW |

Los containers solo son accesibles a través de **nginx en el host** via los dominios configurados.

---

## OWASP Top 10 — mitigaciones aplicadas

| Riesgo                                         | Mitigación                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| A05 Security Misconfiguration                  | UFW activo, fail2ban, nginx como único punto de entrada              |
| A02 Cryptographic Failures                     | HTTPS forzado en todos los dominios via Certbot + Let's Encrypt      |
| A07 Identification and Authentication Failures | Clave SSH configurada, root login deshabilitado, fail2ban activo     |
| Secrets exposure                               | Doppler para secrets — nunca en el repo ni en `.env` files           |

---

## Checklist para nuevo servidor

- [ ] UFW activo con solo 22, 80, 443
- [ ] Clave pública en `~/.ssh/authorized_keys` via `ssh-copy-id`
- [ ] `PermitRootLogin no` en sshd_config
- [ ] fail2ban instalado y activo
- [ ] Certbot instalado y certificados generados
- [ ] Doppler instalado y service tokens configurados
- [ ] PostgreSQL NO expuesto (solo accesible desde containers internos)
