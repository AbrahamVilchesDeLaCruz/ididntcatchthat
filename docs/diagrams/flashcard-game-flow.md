# Flashcard Game Flow

```mermaid
sequenceDiagram
    actor User
    participant Client as React Client
    participant API as NestJS API
    participant DB as PostgreSQL (Aiven)
    participant CDN as Cloudflare CDN
    participant Azure as Azure Speech

    User->>Client: Inicia sesión de juego
    Client->>API: GET /sessions/start
    API->>DB: Selecciona flashcards (spaced repetition)
    DB-->>API: Lista de flashcards
    API-->>Client: Flashcards de la sesión

    loop Por cada flashcard
        Client->>CDN: GET audio (acento seleccionado)
        CDN-->>Client: Stream de audio
        Client->>User: Reproduce audio

        User->>Client: Responde (selecciona opción)
        Client->>API: POST /sessions/:id/answer
        API->>DB: Guarda respuesta + actualiza intervalo SR
        DB-->>API: OK
        API-->>Client: Resultado + siguiente flashcard

        alt Usuario activa bonus pronunciación
            User->>Client: Graba pronunciación
            Client->>API: POST /pronunciation/evaluate (audio blob)
            API->>Azure: Envía audio para scoring
            Azure-->>API: Score por fonema / palabra / frase
            API->>DB: Guarda PronunciationScore
            API-->>Client: Score + feedback visual
        end
    end

    Client->>API: POST /sessions/:id/finish
    API->>DB: Guarda resumen de sesión + actualiza streak
    API-->>Client: Resumen (XP, streak, accuracy)
    Client->>User: Muestra resultados de sesión
```

## Notas

- El algoritmo de spaced repetition determina qué flashcards aparecen y en qué orden
- El audio se sirve siempre desde Cloudflare — nunca desde la API
- El bonus de pronunciación es opcional por flashcard — el usuario decide si lo activa
- Al finalizar la sesión se actualiza el streak y se calculan los puntos de XP
