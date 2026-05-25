# Use Cases: Get Categories Catalog

```mermaid
flowchart TD
    A([Client — any]) -->|GET /catalogs/categories| B[GetCategoriesGetController]
    B --> C[CatalogQuerier.run]
    C --> D{serializar CATEGORIES_CATALOG}
    D --> E[CategoryCatalogEntry array]
    E --> F([200 OK — lista de categorías con subcategorías y labels])
```

## Notas

- No requiere autenticación (`@Public()`)
- No consulta DB ni repositorio alguno
- La respuesta es determinista y cacheable en cliente (no cambia entre deploys)
- Los labels son para presentación — el valor que se envía al backend al crear una flashcard es el `value` del enum
