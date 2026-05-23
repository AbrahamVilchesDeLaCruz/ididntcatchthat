# Guest Auth — Diagrama de Casos de Uso

> Actores y escenarios de `POST /auth/guest`

```mermaid
graph TD
    subgraph Actores
        G[Visitante anónimo]
    end

    subgraph Sistema
        UC1[Obtener token guest]
        UC2[Renovar token guest]
    end

    subgraph Resultado
        R1[accessToken en body]
        R2[refreshToken en cookie httpOnly]
    end

    G -->|POST /auth/guest| UC1
    G -->|POST /auth/refresh con cookie| UC2

    UC1 --> R1
    UC1 --> R2
    UC2 --> R1
    UC2 --> R2

    note1[Token guest permite jugar\nsin crear cuenta\nLímite 3 partidas/día por deviceId]
    UC1 --- note1
```
