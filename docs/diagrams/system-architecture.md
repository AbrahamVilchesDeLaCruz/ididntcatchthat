# System Architecture

```mermaid
graph TB
    subgraph User["👤 Usuario"]
        Browser["🌐 Browser"]
    end

    subgraph OVH["☁️ VPS OVHcloud"]
        direction TB
        Nginx["⚡ Nginx\nReverse Proxy"]

        subgraph App["Aplicación"]
            Frontend["⚛️ React SPA\nStatic Build"]
            API["🔧 NestJS API"]
        end

        subgraph Observability["Observabilidad"]
            direction LR
            Prometheus["📊 Prometheus"]
            Loki["📋 Loki"]
            Grafana["📈 Grafana"]
        end

        Nginx --> Frontend
        Nginx -->|"/api"| API
        API -->|"metrics"| Prometheus
        API -->|"logs"| Loki
        Prometheus --> Grafana
        Loki --> Grafana
    end

    subgraph Data["🗄️ Datos"]
        DB[("🐘 PostgreSQL\nAiven")]
    end

    subgraph Media["🎵 Media"]
        R2["☁️ Cloudflare R2\nAudio Storage"]
        CDN["🌍 Cloudflare CDN\nEdge Network"]
        R2 --> CDN
    end

    subgraph AI["🤖 Servicios IA"]
        ElevenLabs["🎙️ ElevenLabs\nAudio Generation"]
        Azure["🗣️ Azure Speech\nPronunciation Scoring"]
    end

    Browser -->|"HTTPS"| Nginx
    Browser -->|"🎵 stream audio"| CDN

    API -->|"read / write"| DB
    API -->|"upload audio\n(offline pipeline)"| R2
    API -->|"generate audio\n(admin backoffice)"| ElevenLabs
    API -->|"evaluate pronunciation\n(real-time)"| Azure
```

## Flujo de datos clave

| Flujo | Ruta |
|---|---|
| Usuario juega | Browser → Nginx → API → DB |
| Usuario escucha audio | Browser → Cloudflare CDN (nunca pasa por la VPS) |
| Admin crea flashcard | API → ElevenLabs → Cloudflare R2 |
| Usuario practica pronunciación | Browser → API → Azure Speech |
| Métricas y logs | API → Prometheus / Loki → Grafana |
