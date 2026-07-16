# ADR 032 — MinIO como S3-compatible local para sustitución de Cloudflare R2

**Estado**: Aceptado
**Fecha**: 2026-07-15
**Autores**: equipo ididntcatchthat

---

## Contexto

La plataforma almacena y sirve archivos de audio (MP3 de las flashcards) desde **Cloudflare R2** en producción — ver [ADR-005](./005-cloudflare-cdn.md). R2 expone una API compatible con S3 y se configura vía las cinco variables `CLOUD_STORAGE_*` en [`apps/api/.env.example`](../../apps/api/.env.example) (líneas 30–35):

```bash
CLOUD_STORAGE=https://<accountid>.r2.cloudflarestorage.com
CLOUD_STORAGE_PUBLIC_URL=https://pub-...r2.dev
CLOUD_STORAGE_ACCESS_KEY_ID=...
CLOUD_STORAGE_SECRET_ACCESS_KEY=...
CLOUD_STORAGE_BUCKET=idct-prod
```

El perfil **local** (evaluación del TFM sin Doppler, sin Aiven, sin Cloudflare) está documentado en [`docs/local-development.md`](../local-development.md) pero no tenía un ADR que explicara **por qué** las mismas cinco variables funcionan contra MinIO sin tocar código de la app.

El adapter de storage (`R2AudioStorage`) consume las variables anteriores y usa el SDK de AWS S3 — que es compatible con cualquier backend S3-compatible (incluido MinIO).

---

## Decisión

Usar **MinIO** como sustituto local de Cloudflare R2. **Mismas cinco variables, mismo adapter, misma API S3.** La selección se hace por convención, no por código.

### Selección por entorno

| Entorno | Backend | Cómo se eligen las variables |
|---|---|---|
| `local` (Docker compose) | MinIO | `apps/api/.env.example` apuntando a `localhost:9000`, bucket `idct-local` |
| `dev` (Doppler) | Cloudflare R2 | Doppler config `dev` con credenciales del bucket dev |
| `test` (CI) | efímero / mock | [ADR-016](./016-environments-strategy.md) |
| `prod` (VPS) | Cloudflare R2 | Doppler config `prd` con credenciales del bucket prod |

El adapter `R2AudioStorage` **no sabe en qué entorno está**. Solo lee las variables y habla S3.

### Arranque del bucket local

[`infra/docker-compose.local.yml`](../../infra/docker-compose.local.yml) levanta dos containers:

- `minio` — servidor MinIO con la imagen `minio/minio:RELEASE.2025-07-23T15-54-02Z`, expone `:9000` (API) y `:9001` (consola).
- `minio-init` — one-shot con `minio/mc` que crea el bucket `idct-local` y aplica la policy pública de lectura sobre los objetos. Sin este paso, los `GET` a las URLs públicas devuelven 403.

El stack se inicializa con `make local-up` o automáticamente como parte de `make local-start` (ver [local-development.md](../local-development.md)).

### Paridad con R2

| Característica | R2 prod | MinIO local |
|---|---|---|
| API S3 | Sí (v4 signed) | Sí (v4 signed) |
| URL pública por objeto | `https://pub-...r2.dev/<key>` | `http://localhost:9000/<bucket>/<key>` (con `CLOUD_STORAGE_PUBLIC_URL`) |
| `PutObject` desde la app | SDK AWS S3, mismo cliente | SDK AWS S3, mismo cliente |
| Política de bucket público | Dashboard / API R2 | `mc anonymous set download` (en `minio-init`) |

La app llama a `getSignedUrl()` o `publicUrl` indistintamente — el resultado es una URL HTTP que el cliente `<audio>` reproduce.

---

## Alternativas consideradas

### LocalStack

**Rechazado.** LocalStack simula **toda** la nube AWS (S3 + SQS + Lambda + Dynamo + …). Para un proyecto que solo necesita S3, el peso en memoria (~500 MB–1 GB por stack) y el tiempo de arranque (15–30s) no se justifican. MinIO pesa ~150 MB y arranca en 2–3s.

### Filesystem plano (multer + directorio local)

**Rechazado.** Rompe la paridad: el adapter tendría dos implementaciones divergentes (R2AudioStorage vs LocalFsStorage), una por entorno. Cualquier feature nueva (URLs firmadas, presigned POST, multipart upload, lifecycle rules) tendría que implementarse dos veces. El bug "funciona en local pero no en prod" es el resultado natural.

### Volcado directo a Cloudflare R2 desde local

**Rechazado.** Implica credenciales de R2 reales en `.env.local` (complejidad de Doppler para evaluadores), y ancho de banda de subida innecesario (los archivos seed son 771 MP3 × ~50 KB cada uno).

### No tener storage local — desactivar audio en local

**Rechazado.** La experiencia de evaluación del TFM requiere reproducir audio. Un backoffice sin audio no enseña el producto.

---

## Consecuencias

**Positivas:**

- **Cero código condicional** en el adapter — `if (env === 'local')` no existe.
- La app no se reinicia ni recompila cuando se mueve de local a dev o prod — solo cambian las variables de entorno (vía Doppler).
- Evaluadores del TFM pueden ejecutar `make local-start` y tener audio funcional sin crear cuenta en Cloudflare.
- El bucket `idct-local` se recrea limpio en cada `make local-reset`.

**Negativas / trade-offs:**

- MinIO no replica todas las features de R2 (e.g. R2 tiene cache automático en la CDN de Cloudflare; MinIO no). En local la latencia de audio es mayor porque va al container, no a un CDN.
- `CORS` del bucket MinIO está abierto por defecto (`*`) — aceptable en local, **inaceptable en prod** (R2 ya está configurado con la lista de orígenes correcta vía [ADR-005](./005-cloudflare-cdn.md)).
- El volumen Docker de MinIO no se limpia automáticamente — `make local-reset` lo purga.

**Limitaciones documentadas:**

- El seed importa 771 flashcards con URLs que apuntan al bucket R2 de dev (`pub-...r2.dev`), no al MinIO local — ver [local-development.md](../local-development.md#limitaciones-conocidas). Para evaluar audio en local puro se requiere conexión a internet para alcanzar el CDN de Cloudflare, o re-seedear con URLs locales.
- El script `minio-init` es best-effort: si falla (e.g. MinIO no está healthy aún), el bucket queda sin crear y los uploads devuelven 404. `make local-status` valida el estado.

---

## Referencias

- [ADR-005 — Cloudflare CDN](./005-cloudflare-cdn.md) — decisión original de R2 en prod
- [ADR-016 — Entornos](./016-environments-strategy.md) — perfil local autocontenido
- [`docs/local-development.md`](../local-development.md) — uso de MinIO en local
- [`infra/docker-compose.local.yml`](../../infra/docker-compose.local.yml) — definición del stack local
- [MinIO docs](https://min.io/docs/minio/container/index.html)