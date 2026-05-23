# Login — Diagrama de Casos de Uso

> Actores y escenarios de `POST /auth/login`

```mermaid
graph TD
    subgraph Actores
        U[Usuario registrado]
        G[Guest con cuenta]
    end

    subgraph Casos de uso
        UC1[Iniciar sesión con email y password]
        UC2[Migrar progreso guest al hacer login]
    end

    subgraph Resultados
        R1[accessToken en body]
        R2[refreshToken en cookie httpOnly]
        R3[Progreso guest migrado — fire & forget]
    end

    subgraph Errores posibles
        E1[401 InvalidCredentials — email no existe]
        E2[401 InvalidCredentials — password incorrecta]
        E3[422 ValidationError — body inválido]
    end

    U -->|POST /auth/login| UC1
    G -->|POST /auth/login + guestDeviceId| UC1
    UC1 -->|si guestDeviceId presente| UC2

    UC1 --> R1
    UC1 --> R2
    UC2 --> R3

    UC1 -->|email no existe| E1
    UC1 -->|password incorrecta| E2
    UC1 -->|body inválido| E3

    note1[E1 y E2 tienen el mismo mensaje\nNo se revela qué campo falló]
    E1 --- note1
    E2 --- note1
```
