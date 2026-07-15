# ADR 031 — DeepSeek como proveedor de IA generativa en backoffice

**Estado**: Aceptado
**Fecha**: 2026-07-15
**Autores**: equipo ididntcatchthat

---

## Contexto

La creación de flashcards en el backoffice necesita tres capacidades de IA que no produce el equipo internamente:

1. **Borradores de flashcards** (`FlashcardDraftGeneratorPort`) — a partir de una categoría + subcategoría + prompt opcional, generar N expresiones originales con ejemplos y fonética. Ver [`docs/domain/content-backoffice.md`](../domain/content-backoffice.md).
2. **Sugerencia de ejemplos** (`AiExampleGenerator`) — para una expresión + categoría, devolver 1–3 oraciones bilingües (EN/ES).
3. **Fonética** (`AiPhoneticsGenerator`) — para una expresión, devolver notación IPA + descripción de uso en habla natural.

Estas llamadas solo se ejecutan desde el backoffice del teacher/admin al crear o completar una flashcard. **No forman parte del flujo del jugador** (ADR-011).

Implementaciones reales:

| Puerto (interface domain) | Implementación infra | Archivo |
|---|---|---|
| `FlashcardDraftGeneratorPort` | `DeepSeekFlashcardDraftGenerator` | [`apps/api/src/content/flashcard/infrastructure/ai/deepseek-flashcard-draft-generator.ts`](../../apps/api/src/content/flashcard/infrastructure/ai/deepseek-flashcard-draft-generator.ts) |
| `AiExampleGenerator` | `DeepSeekAiExampleGenerator` | [`apps/api/src/content/flashcard/infrastructure/ai/deepseek-ai-example-generator.ts`](../../apps/api/src/content/flashcard/infrastructure/ai/deepseek-ai-example-generator.ts) |
| `AiPhoneticsGenerator` | `DeepSeekAiPhoneticsGenerator` | [`apps/api/src/content/flashcard/infrastructure/ai/deepseek-ai-phonetics-generator.ts`](../../apps/api/src/content/flashcard/infrastructure/ai/deepseek-ai-phonetics-generator.ts) |

Las tres usan el cliente `openai` de Node apuntando a `https://api.deepseek.com` con el modelo `deepseek-chat`. El secret `DEEPSEEK_API_KEY` se valida con Joi en [`apps/api/src/shared/infrastructure/config/env.validation.ts`](../../apps/api/src/shared/infrastructure/config/env.validation.ts) (línea 33).

En local se sustituyen por stubs (`USE_STUB_ADAPTERS=true`) — ver [ADR-016](./016-environments-strategy.md).

---

## Decisión

Usar **DeepSeek** (`deepseek-chat` vía API compatible con OpenAI) como proveedor único de las tres capacidades, exclusivamente desde el backoffice.

### Coste observado

DeepSeek cobra por token (entrada + salida). Estimaciones para el volumen real del TFM (no medido formalmente, ver [capacity-plan.md](../runbook/capacity-plan.md) para el caveat):

| Operación | Tokens entrada (aprox) | Tokens salida (aprox) | Uso estimado/mes |
|---|---|---|---|
| Drafts (batch 5–20 cards) | 600–1 500 | 1 500–6 000 | ~10 lotes/mes |
| Examples por flashcard | 80–120 | 100–250 | ~50 cards/mes |
| Phonetics por flashcard | 30–50 | 40–80 | ~50 cards/mes |

A tarifas DeepSeek (~$0.14/M input, $0.28/M output en `deepseek-chat` a fecha del ADR), el coste mensual es del orden de **dólares**, no euros. No bloquea presupuesto.

### Por qué en backoffice y no en el juego

- **Calidad curada** — la IA propone, el teacher revisa y edita antes de publicar (ADR-011).
- **Latencia** — no impacta el tiempo de respuesta de una partida.
- **Coste controlado** — solo se invoca cuando se crea contenido, no en cada request.
- **Variabilidad** — un mal ejemplo no llega al usuario final porque hay revisión humana.

### Estructura del prompt

Los tres generadores usan `temperature` baja (0.3–0.7) y **devuelven solo JSON** sin markdown — ver `deepseek-flashcard-draft-generator.ts` líneas 60–83. Esto evita parsing frágil. La fragilidad residual se mitiga con `try/catch` y fallback `[]`/`{}` en los tres archivos (líneas 41–42, 85–86, 38–39 respectivamente).

---

## Alternativas consideradas

### OpenAI GPT-4o-mini

**Rechazado.** Coste ~10× superior por token de salida a `deepseek-chat` para una calidad equivalente en tareas estructuradas bilingües EN/ES. Para un TFM con presupuesto cero no se justifica. Se consideraría si el volumen subiera a miles de generaciones/mes — pero entonces se reabre el debate de IA en el flujo del juego (rechazado por ADR-011).

### Anthropic Claude Haiku

**Rechazado.** Calidad excelente, pero el equipo quería **explorar opciones de LLM de origen chino** como ejercicio deliberado del TFM (criterio explícito de la fase de selección: "considerar al menos un proveedor no-US"). DeepSeek cumplía ese criterio con un coste aún menor que Haiku.

### Mistral 7B / Mixtral (self-hosted)

**Rechazado.** Self-hosting añade carga operacional en el VPS (ya ajustado en RAM — ver [capacity-plan.md](../runbook/capacity-plan.md)) y un modelo 7B en CPU no ofrece la calidad necesaria para IPA + connected speech con baja temperatura. Se reservaría como opción si se eliminara la dependencia de APIs externas por completo — pero eso entra en conflicto con la generación de audio (ElevenLabs, ADR-009), también externa.

### Sin IA — contenido 100% manual

**Parcialmente en vigor.** ADR-011 ya establece que el contenido es curado. La IA aquí asiste al teacher; no genera contenido sin supervisión. Esta opción es la línea base — la IA es opcional y se puede desactivar (`USE_STUB_ADAPTERS=true` en local). En producción DeepSeek siempre está activo.

---

## Consecuencias

**Positivas:**

- Coste mensual bajo (estimado <$5 con el volumen del TFM).
- API compatible con OpenAI — el código no se acopla a DeepSeek como proveedor; un swap futuro a OpenAI/Anthropic es cambio de `baseURL` + `model`.
- Tres roles bien separados en el dominio (`FlashcardDraftGeneratorPort`, `AiExampleGenerator`, `AiPhoneticsGenerator`) — se puede cambiar la implementación de uno sin tocar los otros.
- Stubs en local permiten desarrollo offline sin coste de API.

**Negativas / trade-offs:**

- Dependencia de un proveedor externo único para la generación de contenido — si DeepSeek cae, el backoffice no puede sugerir borradores. La creación manual sigue siendo posible.
- El parsing de JSON directo del LLM es frágil si el modelo responde con markdown o texto extra. Mitigado con `temperature` baja y trim — pero no es 100% robusto.
- Los IDs de voz de ElevenLabs (US/UK/AU) son otro secreto separado y otro proveedor — ver [ADR-009](./009-elevenlabs.md).

**Riesgos aceptados:**

- Privacidad: las expresiones enviadas a DeepSeek pueden ser educativas (no PII). El teacher es responsable de no enviar datos personales en prompts custom.
- Latencia: una generación de 20 borradores puede tardar 5–15s. El backoffice lo asume como tarea background — no es un bloqueo de UX.

---

## Referencias

- [ADR-009 — ElevenLabs](./009-elevenlabs.md) — generación de audio (el otro proveedor externo de contenido)
- [ADR-011 — Contenido curado](./011-curated-content.md) — por qué la IA no está en el flujo del juego
- [ADR-016 — Entornos](./016-environments-strategy.md) — stubs locales con `USE_STUB_ADAPTERS`
- [ADR-017 — Doppler](./017-secrets-doppler.md) — gestión de `DEEPSEEK_API_KEY`
- [DeepSeek API docs](https://api-docs.deepseek.com/)
- Skill de implementación: [skills/api-shared](../../skills/api-shared/SKILL.md) — patrón de adapter para LLMs