# Payload & Query Templates

## POST / PATCH Payload

File: `{context}/infrastructure/controllers/{verb}-{entity}-{method}.payload.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean,
  IsEnum, IsUUID, Min, Max, IsArray, ValidateNested,
} from 'class-validator';

export class {Verb}{Entity}{Method}Payload {
  @ApiProperty({ description: 'Description of the field', example: 'value' })
  @IsString()
  @IsNotEmpty()
  requiredField: string;

  @ApiPropertyOptional({ description: 'Optional field', example: 'value' })
  @IsOptional()
  @IsString()
  optionalField?: string;

  @ApiProperty({ description: 'Enum field', enum: SomeEnum })
  @IsEnum(SomeEnum)
  enumField: SomeEnum;

  @ApiProperty({ description: 'Integer in range', minimum: 1, maximum: 50 })
  @IsInt()
  @Min(1)
  @Max(50)
  numericField: number;

  @ApiProperty({ description: 'UUID reference' })
  @IsUUID()
  idField: string;
}
```

## GET Query

File: `{context}/infrastructure/controllers/{verb}-{entity}-get.query.ts`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class {Verb}{Entity}GetQuery {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by status', enum: SomeStatusEnum })
  @IsOptional()
  @IsEnum(SomeStatusEnum)
  status?: SomeStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by text (partial match)' })
  @IsOptional()
  @IsString()
  search?: string;
}
```

## Rules reminder

- `@Type(() => Number)` **solo en Query** — los query params llegan como strings desde HTTP
- Nunca `@Type()` en Payloads — los body JSON ya vienen tipados
- `@IsOptional()` para campos opcionales simples
- `@ValidateIf(o => o.field !== undefined)` para validaciones condicionales complejas
- `@ApiProperty` / `@ApiPropertyOptional` en todos los campos — Swagger lo requiere
