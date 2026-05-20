# Audio Generation Pipeline

```mermaid
sequenceDiagram
    actor Admin
    participant Backoffice as React Backoffice
    participant API as NestJS API
    participant DB as PostgreSQL (Aiven)
    participant Queue as Job Queue (Bull)
    participant ElevenLabs as ElevenLabs API
    participant R2 as Cloudflare R2

    Admin->>Backoffice: Crea / edita flashcard
    Backoffice->>API: POST /flashcards (o PUT /flashcards/:id)
    API->>DB: Guarda flashcard (audio_status: pending)
    API->>Queue: Encola job de generación de audio
    API-->>Backoffice: Flashcard creada (audio pending)

    Queue->>API: Procesa job

    loop Por cada acento (American, British, Australian)
        API->>ElevenLabs: POST /text-to-speech (texto + voice_id)
        ElevenLabs-->>API: Audio buffer (mp3)
        API->>R2: PUT audio file
        R2-->>API: URL pública del archivo
        API->>DB: Guarda URL del audio para ese acento
    end

    API->>DB: Actualiza audio_status: ready
    API-->>Backoffice: (webhook / polling) Audio generado ✓
    Backoffice->>Admin: Notifica que el audio está listo
```

## Notas

- La generación es **asíncrona** — el admin no espera bloqueado mientras ElevenLabs genera
- Bull gestiona reintentos automáticos si ElevenLabs falla o tiene timeout
- Cada flashcard puede tener hasta 3 audios: `audio_url_us`, `audio_url_uk`, `audio_url_au`
- Los archivos nunca tocan la VPS en producción — van de ElevenLabs directamente a R2 vía la API
- El backoffice puede mostrar estado `pending | generating | ready | error` por flashcard
