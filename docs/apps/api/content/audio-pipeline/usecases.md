# Audio Pipeline — Casos de Uso

```mermaid
---
title: Audio Pipeline — Casos de uso (sistema)
---
graph TB
    Sistema(["⚙️ Sistema (Handler)"])
    Admin(["👤 Admin"])

    UC1["Generar audio tras crear flashcard"]
    UC2["Regenerar audio tras editar expression/examples"]
    UC3["Marcar audio como failed en error"]
    UC4["Reintentar audio failed desde backoffice"]

    Sistema --> UC1
    Sistema --> UC2
    Sistema --> UC3
    Admin --> UC4
```

## Reglas de negocio

| Regla | Acción |
| ----- | ------ |
| 4 archivos de audio por flashcard: expression ×3 (US, UK, AU) + examples ×1 (US) | Generados en paralelo |
| El audio se genera de forma **asíncrona** (no bloquea la creación) | Disparado por eventos tras enrich/create |
| Si cambia `expression` o `examples` en una edición → regenerar | Handlers de eventos de dominio |
| Si cambia solo `meaning`, `ipa`, `nativeSpeech` → NO regenerar | Los handlers de audio ignoran el cambio |
| La flashcard es visible mientras el audio está pendiente | `audioStatus`: `pending` \| `generating` → skeleton en cliente |
| Error en ElevenLabs o CDN → `audioStatus: failed` | Log + métrica `app_audio_errors_total` |
| Retry manual admin | `POST /v1/flashcards/:id/regenerate-audio` solo si `failed` — ver [regenerate-audio](../regenerate-audio/usecases.md) |
| Troubleshooting 401 / keys | [troubleshooting/audio-generation.md](../../../../troubleshooting/audio-generation.md) |
