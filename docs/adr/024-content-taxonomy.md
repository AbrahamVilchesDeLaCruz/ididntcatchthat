# ADR-024: Taxonomía de contenido unificada + generación asistida por IA

**Date**: 2026-06-25  
**Status**: Accepted

## Context

El catálogo de flashcards usaba nomenclatura heredada de currículos externos (`mastering_sounds`, `THE_T_SOUND`, `WANNA_AND_GONNA`, etc.) y slugs distintos entre Content, Gaming, Progress y el cliente. El backoffice importaba flashcards desde PDF con IA, un flujo frágil y difícil de mantener.

## Decision

1. **Vocabulario unificado** en cuatro módulos de aprendizaje: `native_sounds`, `connected_speech`, `flow_connectors`, `real_talk`.
2. **Catálogo propio** de subcategorías con slugs, labels ES/EN, descripciones y `anchorExamples` — documentado en [`docs/domain/content-taxonomy.md`](../domain/content-taxonomy.md).
3. **Eliminar import PDF** — reemplazado por `POST /ai/generate-flashcards` en backoffice.
4. **IA genera borradores, humano publica** — los drafts no se persisten hasta confirmación explícita vía `POST /flashcards/bulk` (coherente con ADR-011).

## Política de nomenclatura

| Prohibido | Convención ididntcatchthat |
|-----------|----------------------------|
| `THE_X_SOUND`, `sound_x` | `{letra}_{ancla}` → `v_vacation` |
| `FLAP_T_*`, `flap_t` | Fenómeno descriptivo → `t_soft_between_vowels` |
| `WANNA_AND_GONNA` | Agrupación pedagógica → `informal_going_to` |
| Pares comparativos en un slug | Un sonido = un slug (Native Sounds) |
| Referencias a currículos externos | Labels en español con palabra ancla |

## Rationale

- Un solo enum (`LearningModule`) evita bugs de mapeo entre BCs (p. ej. selector de flashcards en Gaming).
- Slugs legibles facilitan seeds, filtros y documentación.
- Generación LLM con deduplicación contra DB es más flexible que extracción PDF y mantiene control de calidad humano.
- Labels amigables para hispanohablantes mejoran UX en backoffice y juego.

## Alternatives Considered

- **Migración incremental de slugs legacy** — descartada: DB vacía en dev, re-seed más simple.
- **Mantener PDF import + LLM** — duplicidad de flujos sin beneficio claro.
- **IA publica directamente** — rechazado por ADR-011 (calidad fonética requiere revisión).

## Consequences

- `subcategory-enums.ts` y todo el pipeline PDF eliminados.
- `FlashcardCatalogQuerier` devuelve labels y metadatos por subcategoría.
- Cliente: `AiGenerateModal` reemplaza `ImportPdfModal`; i18n y filtros usan los cuatro slugs nuevos.
- Tests, seeds y docs sincronizados con [`content-taxonomy.md`](../domain/content-taxonomy.md).
