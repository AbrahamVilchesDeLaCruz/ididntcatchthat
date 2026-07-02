# Record Page View — Casos de Uso

```mermaid
---
title: Record Page View — Casos de uso
---
graph TB
    Visitor(["🌐 Visitante / Usuario"])

    UC1["Registrar visita al cambiar de ruta SPA"]
    UC2["Asociar visita a userId si hay sesión"]
    UC3["Ver error: path o visitorId inválido"]

    Visitor --> UC1
    UC1 --> UC2
    UC1 -.->|"<<extend>>"| UC3
```

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Auth | Ninguna — endpoint público |
| Respuesta | 204 void (command, sin envelope) |
| `visitorId` | UUID anónimo persistente en localStorage |
| `userId` | Opcional — null si guest o no logueado |
| Persistencia | Append-only en `page_views` |
| Silencioso | Errores no bloquean navegación en cliente |
