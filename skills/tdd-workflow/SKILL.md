---
name: tdd-workflow
description: >
  Workflow obligatorio de TDD antes de escribir cualquier código nuevo: Red → Green → Refactor.
  Aplica a api (Jest) y client (Vitest + RTL). Trigger: Antes de implementar cualquier feature, use case, hook o componente nuevo.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

Cargar esta skill ANTES de escribir cualquier código nuevo:

- Nuevo use case o domain service (api)
- Nuevo aggregate o value object (api)
- Nuevo hook de pod (client)
- Nuevo Container o Component (client)
- Nuevo mapper, helper o función utilitaria (api o client)

**NO aplica a**: cambios de configuración, migraciones, refactors puros sin nuevo comportamiento.

## El Workflow — Siempre en Este Orden

### Paso 1 — Entender qué se va a construir

Antes de escribir ni una línea, responder:

1. ¿Qué comportamiento nuevo estamos añadiendo? (en lenguaje de negocio, no técnico)
2. ¿En qué capa vive? (domain, application, infrastructure, client-hook, client-component)
3. ¿Cuáles son los escenarios happy path y los casos de error?

### Paso 2 — RED: escribir el test que falla

El test se escribe **antes** que la implementación. Sin excepciones.

**En api (Jest):**

```typescript
// test/contexts/{context}/application/{verb}/{use-case}.spec.ts
describe('{context}/application/{verb} {ClassName}', () => {
  it('should {comportamiento esperado en lenguaje de negocio}', async () => {
    // Arrange — construir datos con Object Mothers
    const request = RequestFlashcardCreatorMother.random();

    // Act
    await useCase.execute(request);

    // Assert — verificar efecto observable, no implementación interna
    expect(repository.save).toHaveBeenCalledWith(FlashcardMother.from(request));
  });

  it('should throw {DomainError} when {condición}', async () => {
    await expect(useCase.execute(invalidInput)).rejects.toThrow(SomeDomainError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
```

**En client (Vitest + RTL):**

```typescript
// src/pods/{pod}/components/__tests__/{Component}.test.tsx
describe('{Component}', () => {
  it('should {comportamiento esperado}', () => {
    render(<Component {...props} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
```

**Verificar que el test falla**: correr el test y confirmar que el error es el esperado (not found, not implemented), no un error de sintaxis o import.

### Paso 3 — GREEN: mínimo código para pasar el test

Escribir **solo lo necesario** para que el test pase. Sin optimizar. Sin anticipar casos futuros.

Reglas:
- Si hay que crear el archivo de implementación, crearlo ahora.
- Si el test pide un `FlashcardMother` que no existe, crearlo también.
- No añadir lógica que el test no exige todavía.

### Paso 4 — Refactor: limpiar manteniendo verde

Con el test en verde:
- Eliminar duplicación
- Renombrar para claridad
- Extraer métodos si el método hace más de una cosa
- **Los tests deben seguir en verde** después de cada cambio

### Paso 5 — Repetir por cada escenario

Volver al Paso 2 para el siguiente escenario. Un ciclo Red → Green → Refactor por comportamiento.

---

## Qué Testear Según la Capa

| Capa | Qué testear | Tool |
|---|---|---|
| Use Case (api) | Flujo completo: happy path + errores de dominio | Jest + jest-mock-extended |
| Domain Service (api) | Comportamiento de negocio aislado | Jest |
| Hook del pod (client) | Estado, handlers, side effects | Vitest + renderHook |
| Mapper (api/client) | Transformación entrada → salida | Jest / Vitest (función pura) |
| Component (client) | Renderizado, interacciones UI | Vitest + RTL |
| Container (client) | Flujo completo con HTTP mockeado | Vitest + RTL + MSW |

**El Domain (aggregates, VOs) no se testea en aislamiento** — se ejercita a través de los tests del Use Case que los invoca.

---

## Reglas No Negociables

- **El test se escribe antes**. Siempre. No hay excepción.
- **Un test = un comportamiento observable**. No testear implementación interna (`calls repository.match`), sino efecto (`saves the flashcard`).
- **El nombre describe el comportamiento**: `it('throws FlashcardNotFound when flashcard does not exist')`, no `it('calls repository.match')`.
- **Verificar que el test falla antes de implementar** — un test que nunca falla no prueba nada.
- **Object Mothers siempre** para construir datos de test. Nunca literales inline.
- **No mockear lo que no controlás** — usar abstracciones propias en lugar de mockear `Date` o `Math.random` directamente.

---

## Relación con Otras Skills

- Para el **CÓMO** crear Mothers, mocks y estructura de `/test` en api → cargar `api-testing`
- Para el **CÓMO** testear hooks, RTL y MSW en client → cargar `client-testing`
- Esta skill define el **CUÁNDO y EN QUÉ ORDEN** — siempre va primero
