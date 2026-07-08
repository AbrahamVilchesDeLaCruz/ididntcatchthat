# Troubleshooting — generación de audio (ElevenLabs)

Guía para diagnosticar fallos en el pipeline offline de audio de flashcards.

---

## Flujo normal

1. Admin crea/edita flashcard → eventos de dominio vía RabbitMQ
2. `FlashcardAudioGenerator` marca `audio_status = generating`
3. Llama a ElevenLabs (3 acentos + ejemplos) y sube MP3 a R2/MinIO
4. Marca `audio_status = ready` con URLs en `audio_urls`
5. Si falla → `audio_status = failed` + log `FlashcardAudioGenerator failed`

---

## Interpretar logs

### `PARAMETERS: ["generating","<uuid>"]`

TypeORM registrando un `UPDATE` que pone `audio_status = 'generating'`. A veces aparece truncado como `METERS` en logs de Docker. **No es un error de métricas.**

### `ElevenLabs error: 401 Unauthorized`

ElevenLabs rechazó la API key. El pipeline funciona; el problema es **credencial o cuenta**, no la lógica de la app.

Causas habituales:

| Causa | Qué hacer |
|-------|-----------|
| `ELEVEN_LABS_API_KEY` vacía o mal copiada en Doppler | Verificar secret (ver abajo) |
| Key revocada en dashboard ElevenLabs | Regenerar key y actualizar Doppler |
| Contenedor con env antiguo | Redeploy API tras cambiar Doppler |
| Cuenta/plan ElevenLabs caducado | Revisar billing en ElevenLabs |

Voice IDs inválidos suelen dar **404/422**, no 401.

---

## Verificar secrets (Doppler dev/prod)

```bash
doppler secrets get ELEVEN_LABS_API_KEY --config dev --project ididntcatchthat --plain | wc -c
doppler secrets get ELEVENLABS_VOICE_ID_AMERICAN --config dev --plain
```

Variables requeridas (ver `apps/api/src/shared/infrastructure/config/env.validation.ts`):

- `ELEVEN_LABS_API_KEY`
- `ELEVENLABS_VOICE_ID_AMERICAN`
- `ELEVENLABS_VOICE_ID_BRITISH`
- `ELEVENLABS_VOICE_ID_AUSTRALIAN`

En **local** (`USE_STUB_ADAPTERS=true`) no se llama a ElevenLabs — este 401 solo aparece en entornos con APIs reales (VPS dev/prod, Doppler).

---

## Probar la key directamente

```bash
KEY="$(doppler secrets get ELEVEN_LABS_API_KEY --config dev --project ididntcatchthat --plain)"
VOICE="$(doppler secrets get ELEVENLABS_VOICE_ID_AMERICAN --config dev --project ididntcatchthat --plain)"

curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE}" \
  -H "xi-api-key: ${KEY}" \
  -H "Content-Type: application/json" \
  -d '{"text":"test","model_id":"eleven_multilingual_v2"}'
```

- **200** → key válida; si la app sigue fallando, redeploy del contenedor API
- **401** → actualizar key en ElevenLabs y Doppler, luego redeploy

---

## Recuperar flashcards en `pending` o `failed`

Desde backoffice (`/backoffice/flashcards`):

1. Filtrar por **Pendiente** o **Fallido** (opcional: categoría/subcategoría)
2. **Una flashcard:** detalle → **Generar audio** / **Reintentar** → `POST /v1/flashcards/:id/audio/regenerates` (**204**)
3. **Todas las del filtro:** botón en toolbar → `POST /v1/flashcards/audio/regenerates` (**200**, `{ triggered }`)
4. La tabla hace polling cada 8 s mientras haya `pending` o `generating`

`pending` suele indicar que el pipeline async no arrancó (flashcards antiguas o RabbitMQ caído al crear).

Tras crear una flashcard nueva, el enrich subscriber ejecuta ejemplos → fonética → audio en la misma cadena RabbitMQ.

Documentación completa: [regenerate-audio use cases](../apps/api/content/regenerate-audio/usecases.md).

---

## Observabilidad

- Log estructurado incluye `elevenLabsDetail` cuando ElevenLabs devuelve JSON de error
- Métrica Prometheus: `app_audio_errors_total{provider="elevenlabs"}`

Ver también: [ADR-012](../adr/012-audio-pipeline.md), [deployment.md](../deployment.md)
