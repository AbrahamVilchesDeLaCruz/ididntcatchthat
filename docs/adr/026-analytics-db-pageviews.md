# ADR-026: Analytics basada en base de datos y tracking de visitas web

**Fecha**: 2026-06-29  
**Estado**: Aceptado  
**Contexto**: Backoffice — métricas de negocio y tráfico web

---

## Contexto

Las métricas de Prometheus (`app_*` counters) se acumulan desde el arranque del servidor y se pierden con cada reinicio. No ofrecen datos históricos ni granularidad temporal. Tampoco permiten medir visitas web (la app es un SPA, no hay peticiones de página que Prometheus pueda capturar automáticamente).

El usuario administrador necesita:

- Visitas web reales (rutas visitadas, visitantes únicos, conversión visitante→usuario)
- Tendencias históricas (registros/día, partidas/día, flashcards/día) con múltiples ventanas temporales
- Datos persistentes que sobrevivan reinicios del servidor

---

## Decisión

### 1. Módulo `analytics/` independiente

Se crea `apps/api/src/analytics/` como nuevo bounded context, con:

- **Puerto de escritura**: `PageViewRepository` → `TypeOrmPageViewRepository`
- **Puerto de lectura**: `DbStatsQuery` → `TypeOrmDbStatsQuery`
- **Tabla propia**: `page_views` (UUID, path, visitor_id, user_id nullable, referrer, created_at)

La separación de responsabilidades sigue Clean Architecture: la capa Application define interfaces; Infrastructure las implementa con TypeORM.

### 2. Tracking de visitas via `usePageView()` en el cliente

El frontend registra cada cambio de ruta con un `POST /api/analytics/pageview` (sin autenticación) que incluye:

- `path`: ruta visitada (sin query params)
- `visitorId`: UUID generado en `localStorage` (persiste entre sesiones del mismo navegador)
- `userId`: ID del usuario autenticado, si existe (opcional)
- `referrer`: `document.referrer` para rastrear origen externo

La conversión se calcula como `registeredVisitors / uniqueVisitors × 100`, donde `registeredVisitors` son visitantes cuyo `visitor_id` aparece con al menos un `user_id` asociado.

### 3. Endpoint admin con soporte de múltiples períodos

`GET /admin/analytics/db-stats?period=7d` acepta: `24h | 7d | 15d | 30d | 6m | all`.

Cada período usa una granularidad diferente para las series temporales:

| Período | Granularidad | Serie |
|---------|-------------|-------|
| `24h`   | hora        | 24 puntos |
| `7d`    | día         | 7 puntos |
| `15d`   | día         | 15 puntos |
| `30d`   | día         | 30 puntos |
| `6m`    | semana      | ~26 puntos |
| `all`   | mes         | varía |

Las series temporales usan `generate_series` de PostgreSQL para garantizar que los días/semanas sin actividad aparezcan con valor 0.

### 4. Consultas SQL directas vía `DataSource.query()`

Para analytics de negocio se usan raw SQL queries sobre las tablas existentes (`games`, `users`, `flashcards`) en lugar de repositorios TypeORM, siguiendo el patrón ya establecido por `TypeOrmUserStatsQuery`. Esto permite queries complejas con `generate_series`, `FILTER`, y `GROUP BY` sin overhead de ORM.

---

## Consecuencias

**Positivas:**
- Datos históricos persistentes (no afectados por reinicios del servidor)
- Tasa de conversión visitante→usuario medible sin herramientas externas
- Series temporales reales para tendencias de crecimiento
- El selector de período (24h/7d/15d/30d/6m/total) permite análisis multi-escala

**Negativas/Trade-offs:**
- `page_views` crecerá en volumen; necesitará una política de retención o archivado a largo plazo
- El `visitor_id` en localStorage no distingue dispositivos distintos del mismo usuario
- Las consultas SQL de analytics son complejas y difíciles de mantener; se necesita cuidado al añadir nuevos períodos o métricas

**No decidido:**
- Retención de datos de `page_views` (candidato para una tarea futura de archivado mensual)
- Rate limiting específico para `POST /api/analytics/pageview` (actualmente usa el límite global de 100 req/min)
