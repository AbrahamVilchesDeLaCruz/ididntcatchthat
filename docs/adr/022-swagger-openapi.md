# ADR 022 — API Documentation: OpenAPI / Swagger

**Date**: 2026-05-22  
**Status**: Accepted

---

## Context

La API necesita documentación que sirva como contrato entre el backend y:

- El cliente React (apps/client/)
- Futuros integradores o evaluadores (TFM)
- El equipo durante el desarrollo

Se necesita una solución que genere documentación viva desde el código, sin mantenimiento manual de archivos YAML/JSON separados.

---

## Decision

**`@nestjs/swagger`** (OpenAPI 3.0) con **Swagger UI** expuesto solo en entornos no-productivos.

---

## Conventions

### Setup en `main.ts`

```typescript
const config = new DocumentBuilder()
  .setTitle('ididntcatchthat API')
  .setDescription('API de la plataforma gamificada de aprendizaje de inglés')
  .setVersion('1.0')
  .setContact('ididntcatchthat', 'https://ididntcatchthat.com', '')
  .addBearerAuth()                          // JWT access token
  .addServer('http://localhost:3000', 'Local')
  .addServer('https://api.ididntcatchthat.com', 'Production')
  .build();

const document = SwaggerModule.createDocument(app, config);

if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('docs', app, document);  // GET /docs
}
```

**Swagger UI no se expone en producción** — el JSON spec sí (`/docs-json`) si se necesita para generar clientes.

---

### Tags — uno por Bounded Context

Cada BC usa su tag correspondiente:

| BC | Tag |
|---|---|
| `shared` | `health` |
| `identity` | `auth`, `users` |
| `content` | `flashcards` |
| `gaming` | `games` |
| `progress` | `progress` |
| `pronunciation` | `pronunciation` |
| `ranking` | `ranking` |

```typescript
@ApiTags('health')
@Controller('health')
export class HealthGetController {}
```

---

### Documentar cada endpoint — obligatorio

Todo controller debe tener como mínimo:

```typescript
@ApiOperation({
  summary: 'Descripción corta (aparece en la lista)',
  description: 'Descripción larga opcional — cuándo usarlo, qué hace exactamente',
})
@ApiResponse({ status: 200, description: 'Descripción del caso exitoso', type: HealthResponse })
@ApiResponse({ status: 503, description: 'Servicio no disponible' })
```

---

### Response types — clases tipadas, no `any`

Los tipos de respuesta son clases con `@ApiProperty` — nunca `any`, nunca entidades de dominio.

```typescript
export class HealthResponse {
  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded', 'down'] })
  status: string;

  @ApiProperty({ example: '2026-05-22T12:00:00.000Z' })
  timestamp: string;
}
```

---

### `@ApiProperty` — mínimo requerido por campo

```typescript
@ApiProperty({
  description: 'Descripción del campo',
  example: 'valor de ejemplo real',   // siempre un valor real, no genérico
})
field: string;

@ApiPropertyOptional({
  description: 'Campo opcional',
  example: null,
})
optionalField?: string | null;
```

---

### Auth — Bearer en endpoints protegidos

```typescript
@ApiBearerAuth()           // indica que requiere JWT
@UseGuards(JwtAuthGuard)
@Get('me')
async handler() {}
```

El `addBearerAuth()` en el setup habilita el botón "Authorize" en Swagger UI.

---

### Enums documentados

```typescript
@ApiProperty({
  enum: GameMode,
  enumName: 'GameMode',    // nombre en el schema generado
  example: GameMode.GAME,
})
mode: GameMode;
```

---

### `operationId` semántico

NestJS genera `operationId` automáticamente desde el nombre de la clase del controller. Como cada controller tiene nombre semántico (`HealthGetController`, `CreateFlashcardPostController`), los `operationId` son legibles sin configuración extra.

---

## What We Don't Do

- ❌ No generamos el cliente TypeScript desde el spec (lo hacemos a mano — más control)
- ❌ No mantenemos archivos YAML/JSON del spec fuera del código
- ❌ No exponemos Swagger UI en producción
- ❌ No usamos `@ApiExcludeEndpoint()` para esconder endpoints — si existe, se documenta
- ❌ No usamos DTOs genéricos sin nombre semántico como tipo de respuesta

---

## Consequences

### Positivas
- Documentación siempre sincronizada con el código — no hay drift
- Swagger UI usable para pruebas manuales en desarrollo
- El spec JSON (`/docs-json`) puede usarse para generar clientes en el futuro

### Negativas / Riesgos
- Añade boilerplate de decoradores en cada controller
- Los decoradores `@ApiProperty` en las clases de respuesta son verbosos

---

## References

- [`@nestjs/swagger` docs](https://docs.nestjs.com/openapi/introduction)
- [ADR 002 — NestJS + TypeORM](./002-nestjs-typeorm.md)
