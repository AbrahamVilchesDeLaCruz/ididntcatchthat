# ADR-002: NestJS + TypeORM para el backend

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Se necesita un framework backend para Node.js con TypeScript que soporte Clean Architecture y sea defendible académicamente.

## Decision

Usar **NestJS** como framework principal con **TypeORM** como ORM.

## Rationale

**NestJS:**
- Módulos, inyección de dependencias e interceptores nativos — alineado con Clean Architecture
- Soporte oficial para TypeScript estricto
- Integración nativa con OpenAPI/Swagger para documentación de API
- Módulo oficial `@nestjs/typeorm` para integración con TypeORM

**TypeORM:**
- Integración oficial con NestJS (`@nestjs/typeorm`)
- Patrón Repository nativo — encaja con la capa `infrastructure/` de Clean Architecture
- Migraciones explícitas y controladas
- Validación con Class Validator — decoradores en los DTOs

## Alternatives Considered

- **Prisma**: mejor type safety, pero sin módulo oficial de NestJS y requiere más setup
- **Express + Sequelize**: menor estructura, más difícil de mantener en Clean Architecture

## Consequences

- TypeORM se usa **únicamente en `infrastructure/`** — nunca en domain ni application
- Las entidades de TypeORM son distintas de las entidades de dominio
- Las migraciones son explícitas — nunca `synchronize: true` en producción
