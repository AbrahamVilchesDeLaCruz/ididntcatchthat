# ADR 025 — Backoffice Observability: collectDefaultMetrics, User Stats via DB, InsightCard Pattern

**Estado**: Aceptado  
**Fecha**: 2026-06-29  
**Autores**: Abraham Vilches de la Cruz  
**Relacionado con**: ADR-010, ADR-020

---

## Contexto

La UI de observabilidad del backoffice mostraba únicamente dos métricas Prometheus (`http_requests_total`, `http_request_duration_seconds`) mediante un filtro hardcodeado que descartaba silenciosamente el resto de la API. Varios problemas concretos motivaron esta revisión:

1. `collectDefaultMetrics()` de prom-client nunca se había activado — no existían métricas Node.js runtime (`nodejs_*`, `process_*`) a pesar de que el código del cliente ya preparaba categorías para ellas.
2. `avgMs` del histograma de latencia siempre era `null` porque prom-client expone `_sum` y `_count` como nombres de métrica separados, no como samples del objeto histogram.
3. No había datos de producto — sin usuarios, sin conversión, sin canal de acceso — haciendo el backoffice útil solo para ingenieros.
4. Los números se mostraban crudos sin contexto, lo que obliga al lector a interpretar si un valor es bueno o malo.

---

## Decisión 1 — Activar `collectDefaultMetrics()`

**Activar `collectDefaultMetrics({ register: registry })` en `ObservabilityModule`.**

### Alternativas consideradas

| Opción | Decisión |
|---|---|
| Activar ahora, fase actual | **Elegida** |
| Activar solo en producción | Rechazada — oculta problemas en desarrollo |
| No activar, escribir métricas custom equivalentes | Rechazada — duplicar trabajo que prom-client ya hace |

### Consecuencias

- Se añaden ~15 métricas automáticas: heap, GC, event loop lag, handles, CPU, RSS, uptime.
- El tab "Runtime" de la UI queda funcional sin ningún cambio en el código de aplicación.
- Impacto en rendimiento: pom-client mide event loop lag con un `setInterval` de 10ms — negligible.

---

## Decisión 2 — User stats vía query directa al DB

**Nuevo endpoint `GET /admin/users/stats` que ejecuta queries TypeORM sobre la tabla `users` existente.**

No se integra ninguna herramienta de analytics frontend (PostHog, Plausible, Mixpanel).

### Alternativas consideradas

| Opción | Decisión |
|---|---|
| Query directa a DB (TypeORM QueryBuilder) | **Elegida** |
| PostHog self-hosted | Rechazada — infraestructura adicional no justificada para TFM |
| Plausible (SaaS) | Rechazada — coste y datos de visitantes anónimos sin valor para métricas de producto |
| Enriquecer HTTP logs con user agent / referrer | Rechazada — requiere parsing complejo; referrer no está disponible en tokens JWT |

### Datos disponibles sin joins adicionales

La tabla `users` existente contiene `oauthProvider`, `lastActivityDate`, `currentStreak`, `longestStreak`, `createdAt`, `role`. Es suficiente para calcular: total de usuarios, nuevos registros (7d/30d), usuarios activos, canal de acceso (Google OAuth vs email), engagement rate, rachas.

### Limitación documentada

Sin analytics frontend es imposible conocer el origen de tráfico real (UTM, referrer, campañas). `oauthProvider` se usa como proxy del canal de registro — no como canal de adquisición de tráfico. Esta limitación queda explícita en la UI mediante texto de ayuda.

### Consecuencias

- El endpoint sigue la arquitectura Clean existente: use case → repositorio → controller.
- No requiere nueva tabla ni migración — solo queries sobre datos ya persistidos.
- El endpoint está protegido por `@Roles('admin')` igual que el resto del backoffice admin.

---

## Decisión 3 — InsightCard: lenguaje natural sobre métricas

**Crear un componente `InsightCard` que acompaña cada métrica con una frase contextual y un indicador semántico (verde / ámbar / rojo) basado en umbrales predefinidos.**

### Problema

Las métricas técnicas en bruto — `p95: 247ms`, `heap: 62%`, `errorRate: 0.03%` — requieren que el lector conozca los umbrales relevantes para cada sistema. Un administrador no técnico o un profesor no tiene ese contexto.

### Alternativas consideradas

| Opción | Decisión |
|---|---|
| InsightCard con frase + umbral semántico | **Elegida** |
| Tooltips con explicación al hacer hover | Rechazada — oculta información; requiere interacción |
| Documentación externa de umbrales | Rechazada — no está en el flujo de trabajo del administrador |
| Solo color sin texto | Rechazada — no accesible; ambiguo sin contexto |

### Umbrales de referencia por señal

| Señal | Verde | Ámbar | Rojo |
|---|---|---|---|
| Error rate 5xx | < 0.1% | 0.1–1% | > 1% |
| Latencia p95 | < 200ms | 200–500ms | > 500ms |
| Heap usage | < 70% | 70–85% | > 85% |
| Event loop lag | < 10ms | 10–50ms | > 50ms |
| Tasa de completado | > 70% | 50–70% | < 50% |

### Consecuencias

- La UI del backoffice es útil tanto para ingenieros (números precisos) como para gestores (frases de estado).
- Los umbrales son opinión del autor del sistema — deben revisarse con datos reales de producción.
- Las frases están en español; si el proyecto se internacionaliza, se extraerán a claves i18n.

---

## Consecuencias globales

- El backoffice pasa de 2 métricas en tabla plana a 4 tabs con ~40 señales contextualizadas.
- La activación de `collectDefaultMetrics()` es un cambio de comportamiento en producción — requiere validar que la VPS tiene recursos para las métricas adicionales (impacto < 1MB RAM).
- El endpoint `/admin/users/stats` añade una query DB en cada carga del tab "Usuarios" — sin caché por ahora; aceptable en tráfico de backoffice (< 10 admins).

---

## Referencias

- Setup operacional: [docs/observability.md](../observability.md)
- Spec de esta iteración: [docs/spec/backoffice-observability-v2.md](../spec/backoffice-observability-v2.md)
- Diagrama de flujo: [docs/diagrams/observability-backoffice.md](../diagrams/observability-backoffice.md)
- ADR precedente: [ADR-020](020-observability-strategy.md)
