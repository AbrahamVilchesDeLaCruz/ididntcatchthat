# Auth & Guest — Definición conceptual

---

## Roles y capacidades

| Rol | Registro | Pausa/retoma | Historial | Ranking | Límite partidas |
|-----|:---:|:---:|:---:|:---:|:---:|
| **Guest** | ❌ | ❌ | Solo en sesión | ❌ | 3 × 10 cartas/día |
| **User** | ✅ | ✅ | ✅ persistido | ✅ (opt-in) | Ilimitado |
| **Teacher** | ✅ | ✅ | ✅ | ✅ (opt-in) | Ilimitado |
| **Admin** | ✅ | ✅ | ✅ | ✅ (opt-in) | Ilimitado |

---

## Guest — comportamiento detallado

- **Límite diario**: 3 partidas de máximo 10 flashcards. Al agotar el límite, la app muestra una invitación a registrarse.
- **Progreso en sesión**: los resultados de las partidas se guardan en **estado global frontend** (Zustand store). El usuario puede ver qué accuracy tendría, qué flashcards dominó, etc.
- **Al cerrar el navegador**: todo se pierde. No hay persistencia en localStorage (decisión de seguridad — evitar tokens almacenados).
- **Token guest**: JWT firmado por el backend con `deviceId` + `fingerprint`. Va en memoria JS, no en localStorage.

---

## Migración guest → user

Cuando un guest se registra (o hace login), **todo su estado se migra**:

1. Las partidas jugadas como guest (games + attempts)
2. El progreso por flashcard (`user_flashcard_stats`)

### Cómo funciona

```
Usuario se registra / hace login
    ↓
Backend recibe: { newUserId, guestGames[] }   ← el frontend envía el estado Zustand
    ↓
Use case: MigrateGuestProgressUseCase
    ↓
Itera sobre guestGames[]
  → INSERT game con userId real
  → INSERT attempts de cada game
  → UPSERT user_flashcard_stats (acumula sobre lo que ya hubiera)
    ↓
Frontend limpia el estado guest
    ↓
Usuario continúa con su historial completo
```

El frontend envía el estado Zustand serializado al registrarse — el backend lo procesa como un caso de uso independiente (`MigrateGuestProgressUseCase`).

---

## OAuth Google

Disponible desde el **día uno**, junto con email/password.

Flujo:
```
GET  /auth/google          → redirect a Google
GET  /auth/google/callback → backend intercambia code por profile
                           → crea o busca user en DB
                           → si había guest token: token swap (mismo deviceId)
                           → devuelve access token + refresh token en cookie
```

---

## Privacidad en ranking

El usuario puede optar por **no aparecer** en rankings públicos. Esta preferencia se guarda en el perfil (`show_in_ranking: boolean`, default `false` — opt-in explícito).

Los rankings solo muestran usuarios que han activado esta opción con su nickname visible.
