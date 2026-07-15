# Retrospectiva — ididntcatchthat

> Lecciones aprendidas durante el TFM. Eventos concretos del repo, no generalidades. Si una lección y un commit entran en tensión, gana el commit.

---

## Resumen ejecutivo

Tres fases: **scaffold + producto** (mayo 2026), **auditoría + hardening** (junio–julio 2026), **polish + TFM** (julio 2026). Los bugs más dolorosos fueron de **infraestructura** (Docker, Aiven, migraciones, puertos), no de lógica de dominio. El dominio (Clean Architecture + DDD) salió barato de los refactors porque estaba aislado.

---

## Bugs que nos golpearon

### 1. Docker exponía puertos internos a internet sin querer

**Síntoma:** Probes AMQP desde IPs externas al `5672` del VPS dev aunque UFW solo permitiera `22/80/443`.

**Causa:** Docker publica puertos con reglas `iptables` que se ejecutan **antes** que UFW. `infra/docker-compose.dev.yml` publicaba RabbitMQ y observabilidad en `0.0.0.0`.

**Fix:** ADR-030 — binding `127.0.0.1` para servicios internos. Hotfix temporal `iptables DOCKER-USER` mientras se consolidaba el fix en compose.

**Lección:** UFW no es suficiente con Docker. La regla "nginx = único entrypoint público" debe estar en cada compose. `make security-verify` es parte del deploy, no un extra.

### 2. Migrations de TypeORM ordenadas alfabéticamente rompieron CI E2E

**Síntoma:** Tests E2E fallaban con errores de FK — `games` aún no existía cuando otra migración intentaba `ALTER TABLE games ADD COLUMN subcategory`.

**Causa:** TypeORM ordena por últimos 13 dígitos del class name. Teníamos timestamps que colisionaban en orden lexicográfico.

**Fix:** `f6c4a75` — renombrar sufijos numéricos para que el orden sea explícito, borrar una migración duplicada.

**Lección:** Los timestamps de migración no son documentación, son **protocolo**. Toda migration nueva se revisa contra el orden existente antes de merge.

### 3. `DATABASE_URL` de Aiven rompía las migraciones en prod

**Síntoma:** Migraciones OK en CI, fallaban en VPS prod con `self-signed certificate in certificate chain`.

**Causa:** Aiven usa un cert chain que requiere el CA bundle. `rejectUnauthorized=true` falla sin el CA.

**Fix:** `818766f` — `DATABASE_CA_CERT` opcional. Si está en Doppler → strict verification. Si no → cert chain por defecto.

**Lección:** "Strict by default" en SSL es correcto para runtime, pero las **migraciones** son tooling que debe poder ejecutarse aún sin configuración completa.

### 4. La migration `deleted_at` existía pero no corría

**Síntoma:** Soft-delete funcionaba localmente pero en VPS la columna no existía.

**Causa:** `c029fa9` — la migración estaba en `migrations/` pero no en el array `typeOrmMigrations` de `typeorm-data-source-options.ts`. TypeORM no la auto-descubre.

**Lección:** El array de migrations es código, no configuración mágica. **Si una migration no está en el array, no corre nunca.**

### 5. RabbitMQ AMQP expuesto (mismo síntoma que #1)

**Síntoma:** `accepting AMQP connection <IP-externa> -> ...:5672` desde Shodan/Censys.

**Causa:** `ports: "5672:5672"` hacía que docker-proxy reenviara. RabbitMQ veía la conexión como `172.x.x.x` (red Docker interna) → la protección anti-guest remoto fallaba porque la IP origen ya no parecía externa.

**Fix:** ADR-030 + `make security-rotate-rabbitmq` para rotar credenciales tras incidente.

**Lección:** Cuando un servicio confía en "no aceptes guest desde IPs externas", la IP origen es frágil en Docker. La defensa real es el binding, no la lógica del broker.

---

## Decisiones que nos sorprendieron

### Clean Architecture pagó en la auditoría, no antes

`7aad5b6` (audit completo) renombró tipos, ajustó firmas, movió carpetas entre BCs. Con lógica en controllers, ese refactor habría tocado el doble de archivos. Clean Arch **no se nota cuando va bien** — se nota cuando tienes que cambiar.

### Perfil `local` autocontenido fue la mejor decisión de DX

[ADR-016](./adr/016-environments-strategy.md) introdujo el perfil local con Docker Compose + stubs. Evaluadores pueden clonar y ejecutar `make local-start` con 771 flashcards en < 5 min. Sin Doppler, sin Aiven, sin Cloudflare, sin DeepSeek, sin ElevenLabs. Clave para评审 offline.

### Stubs de IA fueron más fáciles de lo esperado

`USE_STUB_ADAPTERS=true` activa stubs deterministas de DeepSeek (3 generadores). Sin esto, desarrollo offline sería imposible. Joi valida la key aunque no se use — evita bugs "funciona en local, no en prod".

### Tests E2E con DB real revelaron más que unit con mocks

`611051e` descubrió que la tabla `examples` referenciada en el repo no existía — el código apuntaba a una columna que había cambiado a JSONB. Los mocks no lo detectaron porque mockeaban la query. **Conclusión:** E2E son obligatorios para queries SQL reales; mocks ciegan sobre el schema.

### Doppler vs `.env` — la fricción es real pero vale

Doppler añade un paso. Pero elimina el riesgo de commitear una API key. La única vez que mordió fue cuando un dev nuevo intentó `docker compose up` sin `doppler run` — contenedores fallaban con errores de Joi. **Doppler CLI es prerequisito documentado** para `dev` y `prod`.

---

## Lo que funcionó

### Conventional Commits + Husky + commitlint

555 commits filtrables con `git log --oneline --grep="feat:"`. Sin esto, el changelog del TFM hubiera sido ruido indistinguible.

### ADRs como artefactos vivos

Empezamos con 12 ADRs (001–012), llegamos a 33. Cada decisión arquitectónica no-trivial quedó escrita con contexto, alternativas y consecuencias. **Se reutilizó en la defensa** — muchos slides del deck referencian un ADR por número.

### `make help` como punto de entrada único

Makefile raíz delega a `make/local.mk`, `make/dev.mk`, `make/server.mk`, `make/test.mk`. Comandos nuevos documentados en `## Comentario` aparecen automáticamente en `make help`. Sin scripts sueltos olvidados.

### Trivy en CI

[ADR-029](./adr/029-trivy-vulnerability-scanning.md) — `aquasecurity/trivy-action`. Detectó CVEs reales (`pnpm`, `multer`, `undici`) antes de llegar a prod. `exit-code: 1` solo en `CRITICAL,HIGH` con `ignore-unfixed: true`.

### Diagramas Mermaid en Markdown

Diagramas en `.md` con bloques `mermaid`. Renderizan en GitHub, VS Code, y la mayoría de herramientas. Cero imágenes externas que se rompan al refactorizar.

---

## Lo que haríamos diferente

### OpenTelemetry desde día 1

[ADR-020](./adr/020-observability-strategy.md) planificó OTel en "Fase 2 — antes de deploy prod". La primera semana de prod reveló que correlacionar logs con trazas requería OTel. Lo añadimos tarde. **Si va a ser necesaria, mejor tenerla desde el scaffold.**

### Tests E2E primero, mocks después

Algunos módulos del cliente nacieron con unit tests sobre mocks. E2E con Playwright descubrió bugs de integración que los mocks no podían revelar. Empezar por E2E habría evitado retrabajo.

### CSP y Helmet antes que pulir UX

[ADR-033](./adr/033-threat-model.md) documenta que no tenemos Helmet ni CSP. Deuda de seguridad heredada de "primero el producto". 30 min configurando Helmet + CSP `default-src 'self'` al inicio habrían tapado vectores XSS.

### Validar entorno más temprano en CI

CI tardó en tener un job que valide "compose prod levanta con Doppler + secrets reales". Lo añadimos tras un incidente donde un cambio en `env.validation.ts` rompió prod. `make security-verify` debería haber sido parte del template desde día 1.

### No inventar prefijos de variable de entorno

`CLOUD_STORAGE_*` con prefijo neutro (no `R2_*`) permitió el swap a MinIO sin tocar la app ([ADR-032](./adr/032-minio-local-s3.md)). Tardamos en aplicar este principio consistentemente.

---

## Métricas finales (a fecha del TFM)

| Métrica | Valor |
|---|---|
| Commits | 555 |
| PRs mergeados | 100+ |
| ADRs | 30 (ahora 33 con este PR) |
| Bounded Contexts | 9 |
| Endpoints REST | ~60 |
| Migraciones DB | 30+ |
| Proveedores externos | 5 (Aiven, Cloudflare, ElevenLabs, DeepSeek, Doppler) |
| CVEs bloqueados por Trivy | 4 (pnpm, multer, undici ×2) |
| Incidentes de seguridad | 1 (RabbitMQ — mitigado en ADR-030) |

---

## Recomendaciones a quien repita este TFM

1. **Empieza por el perfil `local` autocontenido** — sin él, tu evaluador no puede clonar y ejecutar.
2. **Documenta cada ADR antes de implementar**, no después. El "después" siempre queda peor.
3. **Trivy desde día 1** — el coste de añadirlo tarde es el mismo que añadirlo temprano.
4. **Clean Architecture no es over-engineering para un TFM** — es lo que te permite hacer la auditoría del mes 3 sin llorar.
5. **Conventional Commits + Husky** — 30 min de setup, meses de claridad en el changelog.
6. **Tests E2E con DB real + mocks solo donde tiene sentido** — el ROI de los E2E es brutal en Clean Arch porque el dominio ya está testeado por unit.
7. **No te saltes la retrospectiva al final** — el documento que estás leyendo se hubiera escrito 3 meses mejor si lo hubiéramos empezado en paralelo al proyecto, no al final.

---

## Referencias

- [deployment.md](./deployment.md) · [vps-security.md](./vps-security.md)
- [ADR-016](./adr/016-environments-strategy.md) · [ADR-020](./adr/020-observability-strategy.md)
- [ADR-029](./adr/029-trivy-vulnerability-scanning.md) · [ADR-030](./adr/030-docker-port-binding-policy.md)
- [ADR-032](./adr/032-minio-local-s3.md) · [ADR-033](./adr/033-threat-model.md)