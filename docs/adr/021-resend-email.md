# ADR 021 — Email transaccional: Resend

**Estado**: Aceptado  
**Fecha**: 2026-05-22  
**Autores**: Abraham Vilches de la Cruz

---

## Contexto

La plataforma necesita enviar emails transaccionales a usuarios registrados:

- Bienvenida tras el registro
- Racha rota
- Hitos de racha (30, 100 días)
- Recordatorio de inactividad (> 7 días)

Se requiere un proveedor con buena reputación de entrega, API simple, tier gratuito suficiente para el TFM y sin complejidad operacional adicional en el VPS.

---

## Decisión

**Resend** como proveedor de email transaccional.

---

## Alternativas consideradas

| Proveedor   |       Tier gratuito       | Complejidad | Motivo de descarte                                                           |
| ----------- | :-----------------------: | :---------: | ---------------------------------------------------------------------------- |
| **Resend**  | 3.000 emails/mes, 100/día |   Mínima    | ✅ Elegido                                                                   |
| SendGrid    |          100/día          |    Media    | API más verbosa, reputación de entrega variable en tier free                 |
| Mailgun     |    1.000/mes (3 meses)    |    Media    | Tier gratuito expira, requiere verificación de dominio compleja              |
| SES (AWS)   |   62.000/mes desde EC2    |    Alta     | Requiere cuenta AWS + configuración IAM — overkill para el TFM               |
| SMTP propio |         Ilimitado         |    Alta     | Reputación de entrega pésima sin warmup + gestión de SPF/DKIM/DMARC compleja |

---

## Por qué Resend

- **API minimalista** — una llamada, sin configuración extra
- **SDK oficial para Node.js / NestJS** — integración directa
- **Tier gratuito generoso** — 3.000 emails/mes más que suficiente para el TFM
- **Buena reputación de entrega** — dominio verificado con SPF/DKIM gestionado por ellos
- **React Email compatible** — plantillas con componentes React (opcional pero elegante)
- **Defendible académicamente** — proveedor moderno, bien documentado

---

## Consecuencias

**Positivas:**

- Sin infraestructura adicional en el VPS
- Integración en minutos con el SDK oficial
- Logs y analytics de entrega en el dashboard de Resend

**Negativas / trade-offs:**

- Dependencia de servicio externo (como ElevenLabs o Azure)
- Límite de 100 emails/día en tier free — suficiente para el TFM, no para producción real
- Para escalar necesitaría plan de pago (~$20/mes para 50k emails)

---

## Scope en el TFM

Emails implementados en MVP:

| Trigger                      | Email                          |
| ---------------------------- | ------------------------------ |
| Registro                     | Bienvenida + tips para empezar |
| Racha rota                   | "Se rompió tu racha de N días" |
| Hito de racha (30, 100 días) | Felicitación                   |
| Inactividad > 7 días         | Recordatorio suave             |

Newsletter con tips generados por IA: **documentado, no implementado** — reservado para fase post-entrega.

---

## Referencias

- [Resend docs](https://resend.com/docs)
- [Resend Node.js SDK](https://resend.com/docs/send-with-nodejs)
- Documento de notificaciones: [docs/domain/notifications.md](../domain/notifications.md)
