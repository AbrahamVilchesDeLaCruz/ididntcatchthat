# Generate Flashcards — Casos de Uso

```yaml
title: Generate Flashcards — Casos de uso
actor: Teacher / Admin
endpoint: POST /v1/ai/generate-flashcards
auth: Bearer (teacher | admin)
```

## UC-GEN-01 — Generar borradores con IA

**Actor:** Teacher / Admin  
**Precondición:** Token válido con rol teacher o admin.

**Flujo principal:**

1. El actor selecciona `category`, `subcategory`, `count` (default 10, max 20) y opcionalmente `prompt`.
2. El sistema valida la combinación category/subcategory contra el catálogo.
3. El sistema consulta expresiones existentes en esa subcategoría.
4. El generador LLM produce `FlashcardDraft[]` evitando duplicados.
5. El sistema retorna borradores **sin persistir**.

**Postcondición:** Respuesta 200 con array `drafts` editable en backoffice.

**Extensiones:**

- Subcategoría inválida → 422 `InvalidSubcategory`
- Sin token → 401
- Fallo LLM → 503 (DeepSeek) o stub en local

## UC-GEN-02 — Confirmar borradores (bulk create)

**Actor:** Teacher / Admin  
**Flujo:** Tras revisar drafts en `DraftPreviewPanel`, el actor confirma → `POST /flashcards/bulk` (flujo existente).

> Ver [Bulk Create](../bulk-create/usecases.md).
