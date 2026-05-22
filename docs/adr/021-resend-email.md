# ADR 021 — Email Provider: Resend

**Date**: 2026-05-22  
**Status**: Accepted

---

## Context

La plataforma necesita enviar emails transaccionales en varios puntos del ciclo de vida del usuario:

- Email de bienvenida al registrarse
- Notificación de streak roto
- (Futuro) newsletter con contenido personalizado por IA

Se necesita un proveedor que sea simple de integrar en NestJS, con buena DX, SDK moderno en TypeScript y deliverability confiable para producción.

---

## Options Considered

| Proveedor | Free tier | SDK TS | DX | Deliverability | Precio |
|---|---|---|---|---|---|
| **Resend** | 3.000 emails/mes | ✅ Oficial | ⭐⭐⭐ | Alta | $20/mes (50k) |
| SendGrid | 100 emails/día | ✅ | ⭐⭐ | Alta | $19.95/mes (50k) |
| Mailgun | 1.000 emails/mes (3 meses) | ✅ | ⭐⭐ | Alta | $35/mes (50k) |
| Nodemailer + SMTP | — | Manual | ⭐ | Depende del SMTP | Variable |
| AWS SES | 62k emails/mes (desde EC2) | ✅ | ⭐ | Alta | $0.10/1k |

---

## Decision

**Resend**.

### Razones

1. **SDK TypeScript de primera clase** — `resend.emails.send()` con tipos completos, no wrappers legacy
2. **DX superior** — dashboard limpio, logs de entrega en tiempo real, webhooks simples
3. **Idempotency key nativo** — crítico para el patrón de idempotencia de los handlers de eventos
4. **React Email compatible** — si se quieren templates ricos con componentes React en el futuro
5. **Free tier suficiente para MVP** — 3.000 emails/mes cubre holgadamente el lanzamiento del TFM
6. **Fundadores ex-Vercel** — calidad de producto y DX consistente con el resto del stack

---

## Consequences

### Positivas
- Integración en pocas líneas desde el handler `send_welcome_email_on_user_registered`
- Idempotency key mapeado al `eventId` del mensaje — evita doble envío en retry
- Logs de entrega observables desde el dashboard sin configuración adicional

### Negativas / Riesgos
- Vendor lock-in moderado — migrar implica cambiar el SDK, no la lógica de negocio (está en el handler)
- Si se supera el free tier, $20/mes es el salto mínimo

### Mitigación del lock-in

El handler que envía email vive en la capa `infrastructure/` del BC `Notification`. Está detrás de una interfaz `EmailSender` definida en `application/`. Cambiar de proveedor implica solo cambiar la implementación concreta — no los use cases ni el dominio.

```
notification/
├── application/
│   └── ports/email-sender.port.ts    ← interface — agnóstica del proveedor
└── infrastructure/
    └── email/resend-email-sender.ts  ← implementación concreta con Resend SDK
```

---

## References

- [Resend docs](https://resend.com/docs)
- [ADR 019 — Event Bus Strategy](./019-event-bus-strategy.md) — contexto del handler que usa Resend
