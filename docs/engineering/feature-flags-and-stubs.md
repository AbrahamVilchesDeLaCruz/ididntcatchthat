# Feature flags y stubs — convención del proyecto

> Cómo representar funcionalidad no-implementada en el código y la UI. Cuándo añadir un stub, cómo representar "coming soon" en pantalla, y cuándo eliminarlo.

---

## Principio

**Un stub es una promesa, no una verdad.** Si el código dice "este botón hace X" pero X no existe, el usuario va a intentarlo y se va a frustrar. La convención es:

1. **Si la funcionalidad no está:** no muestres UI que la sugiera, o muéstrala explícitamente como "Próximamente".
2. **Si está parcialmente:** muestra solo lo que funciona.
3. **Si está mockeada en local pero real en prod:** usa `USE_STUB_ADAPTERS` (ya documentado en [ADR-016](./adr/016-environments-strategy.md)).

---

## Cuándo añadir un stub

| Situación | ¿Stub? | Razón |
|---|---|---|
| Feature en el roadmap con fecha tentativa | ✅ Sí, con etiqueta "Próximamente" | Compromete al equipo, no al usuario |
| Feature que existe en el backend pero no en el frontend | ❌ No | No debería existir este gap. Si lo hay, mostrar el feature que sí existe |
| Feature que existe parcialmente (ej. solo mobile) | ⚠️ Sí, condicional al entorno | Mejor que aparezca roto en desktop |
| Feature que se discute en una issue pero sin diseño | ❌ No | No hay nada que stubear todavía |
| Feature que se reservó en el modelo de datos (ej. `premium`) | ⚠️ Stub documentado en docs/, no en UI | Ver [monetization-future.md](./domain/monetization-future.md) |

---

## Tipos de stub

### 1. Stub de i18n (cadena declarada pero no usada en componentes)

**Definición:** existe la clave en `apps/client/src/core/i18n/es.ts` y `en.ts` pero ningún componente la consume.

**Ejemplo real:**

```typescript
// apps/client/src/core/i18n/es.ts:213
play: {
  ...
  micSoon: 'Próximamente',
  ...
}
```

```typescript
// apps/client/src/core/i18n/en.ts:211
play: {
  ...
  micSoon: 'Coming soon',
  ...
}
```

**Estado:** declarado en ambos idiomas pero **no consumido** por ningún `.tsx`. Búsqueda: `grep -rn "micSoon" apps/client/src` solo encuentra las definiciones.

**Riesgo:** i18n keys huérfanas — TypeScript no avisa porque el tipo `Translations` las exige.

**Convención:**

- Si decides dejar la clave huérfana, **documenta aquí por qué** (este doc cumple esa función para `micSoon`).
- Si la feature se implementa, **búscala y úsala**, no añadas una clave nueva.
- Si la feature se descarta, **borra la clave** y la entrada de este doc.

### 2. Stub de UI (botón/badge "Próximamente")

**Cuándo usarlo:** una sección de la UI menciona una feature que el equipo ha decidido implementar pero aún no está lista.

**Cómo renderizarlo:**

```tsx
<button disabled aria-disabled="true" data-soon="true">
  {t.game.play.micSoon}  {/* "Próximamente" / "Coming soon" */}
</button>
```

**Reglas:**

- `disabled` + `aria-disabled="true"` para accesibilidad.
- `data-soon="true"` permite hookear estilos globales (ej. opacidad reducida).
- **Nunca** un botón que parece activo pero no hace nada.
- **Nunca** ocultar la sección entera — la promesa ya está hecha.

**Anti-patrones:**

- ❌ Botón activo que al hacer click muestra un toast "Esta función no está disponible".
- ❌ Sección renderizada con datos mock que no reflejan el comportamiento real.
- ❌ Tooltip "Coming soon" sobre un botón que sí funciona (confunde).

### 3. Stub de i18n con `data-soon` consistente

Si una feature tiene varios elementos stub en la UI (icono + texto + badge), todos llevan `data-soon="true"` para que un override CSS global los distinga:

```css
[data-soon='true'] {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## Inventario actual de stubs

A fecha del TFM:

| Stub | Ubicación | Estado | Plan |
|---|---|---|---|
| `micSoon: 'Próximamente'` / `'Coming soon'` | [`apps/client/src/core/i18n/es.ts:213`](../../apps/client/src/core/i18n/es.ts) y [`en.ts:211`](../../apps/client/src/core/i18n/en.ts) | Claves declaradas, no consumidas | Asociado al bonus de pronunciación (Azure Speech, [ADR-008](./adr/008-azure-speech.md)). El endpoint y el cliente de Azure no están implementados. Clave lista para cuando se monte el feature. |
| `premium` role | [`Migration202605230526271779506787479.ts`](../../apps/api/src/shared/infrastructure/persistence/migrations/Migration202605230526271779506787479.ts) | CHECK constraint acepta el valor; enum TS no | Ver [monetization-future.md](./domain/monetization-future.md). Stub a nivel de modelo de datos, no de UI. |
| Achievement "Level 2 mastery" description | [`apps/client/src/core/i18n/en.ts:438`](../../apps/client/src/core/i18n/en.ts) | Texto placeholder | No es realmente un stub — es texto de un achievement ya implementado. Listado solo para auditoría. |

---

## Cómo añadir un stub nuevo

1. **Abre una issue** describiendo el feature y por qué se stubea ahora.
2. **Declara la clave en ambos idiomas** (`es.ts` + `en.ts`) — usa `Próximamente` / `Coming soon` como valor por defecto.
3. **Marca el botón/elemento con `disabled` + `aria-disabled="true"` + `data-soon="true"`**.
4. **Añade una fila** en este documento (sección "Inventario actual de stubs") con la ubicación exacta.
5. **Referencia la issue** en el commit con `Refs #N`.

## Cómo eliminar un stub

1. Implementa el feature en backend + frontend.
2. Reemplaza el botón stub por el botón funcional.
3. Borra las claves i18n huérfanas (grep + refactor).
4. Borra la fila de este documento.

**Si eliminas la feature en lugar de implementarla:**

1. Borra las claves i18n.
2. Borra la fila de este documento.
3. Cierra la issue referenciada con motivo "descartado".

---

## Cuándo NO usar stubs

| Situación | Alternativa |
|---|---|
| Feature que parece fácil y podrías hacer en 1 sprint | Implementar directamente, no stubear |
| Feature que aún no tiene diseño claro | No añadir UI — esperar al diseño |
| Feature que está "casi lista" pero rompe | Quitar la UI antes de merge, no stubeear |
| Feature que requiere decisión de producto | Crear issue + ADR, no stubear |

El stub es una **decisión de UX consciente**, no un atajo para evitar eliminar UI rota.

---

## Anti-patrones frecuentes

| Anti-patrón | Por qué es malo | Alternativa |
|---|---|---|
| `disabled` sin texto explicativo | El usuario no sabe por qué no puede clickar | Texto + icono + tooltip |
| Tooltip "Próximamente" sobre feature que **sí** funciona | Genera desconfianza ("¿esto funciona o no?") | Eliminar el tooltip |
| Badge "Beta" durante meses | "Beta" se convierte en "nunca termina" | Quitar el badge al lanzar de verdad |
| Feature flag escondido en variable de entorno sin documentar | Nadie sabe que existe | Documentar en `config.yaml` + skill relevante |
| Stub que renderiza UI inconsistente con el feature final | El refactor del feature real será costoso | Implementar el feature lo antes posible |

---

## Relación con feature flags reales

Este proyecto **no usa** feature flags de runtime (LaunchDarkly, Unleash, etc.). Si en el futuro se añaden:

- Los stubs de UI **no son** feature flags. Un stub es estático y nunca cambia en runtime.
- Un feature flag real tendría una clave (`feature.ai_pronunciation = true/false`) en Doppler o en un servicio externo.
- La convención de stubs **se mantiene**: si un feature flag está `false`, la UI usa el patrón stub; si está `true`, renderiza el feature completo.

---

## Referencias

- [ADR-008 — Azure Speech](./adr/008-azure-speech.md) — pronunciation bonus (no implementado)
- [ADR-016 — Entornos](./adr/016-environments-strategy.md) — `USE_STUB_ADAPTERS` para stubs de adapters en local
- [monetization-future.md](./domain/monetization-future.md) — stub a nivel de modelo de datos
- [ADR-029 — Trivy](./adr/029-trivy-vulnerability-scanning.md) — caso opuesto: features de seguridad que **no** deben stubeearse nunca
- Skill client-i18n (cuando se cree) — convención para keys huérfanas