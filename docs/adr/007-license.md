# ADR-007: Business Source License 1.1 (BUSL-1.1)

**Date**: 2026-05-20  
**Status**: Accepted

## Context

El proyecto es un TFM académico que se publicará en un repositorio público. Se necesita una licencia que permita que los profesores y evaluadores lean y estudien el código, pero que proteja el uso comercial del producto.

## Decision

Usar **Business Source License 1.1 (BUSL-1.1)** con fecha de cambio a MIT el **2028-01-01**.

## Rationale

- El código es público y legible — cualquiera puede estudiarlo y contribuir
- Prohíbe explícitamente el uso en producción con fines comerciales sin permiso del autor
- A partir de 2028-01-01 se convierte automáticamente en MIT — estándar abierto
- Diseñada específicamente para software (a diferencia de CC que es para contenido)
- Usada por proyectos reconocidos: HashiCorp Terraform, MariaDB, Sentry

## Alternatives Considered

- **MIT**: demasiado permisiva — permite uso comercial sin restricción
- **GPL v3**: viral — obliga a que cualquier derivado sea también GPL
- **CC BY-NC 4.0**: no diseñada para software, no cubre patentes ni compatibilidad de licencias

## Consequences

- Cualquier persona puede leer, estudiar y modificar el código
- El uso comercial en producción requiere permiso explícito del autor
- En 2028 la licencia cambia automáticamente a MIT sin acción requerida
