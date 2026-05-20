# Prompts de desarrollo

Esta carpeta documenta los prompts utilizados con IA (Claude, GitHub Copilot) durante el desarrollo del proyecto.

El objetivo es mostrar **cómo se usó la IA como herramienta** a lo largo del proceso — qué se le pidió, en qué contexto, y qué decisiones se tomaron a partir de sus respuestas.

## Convención de nombrado

```
{número}-{descripción-corta}.md
```

Ejemplo: `001-monorepo-setup.md`

El número refleja el orden cronológico. Así se puede seguir la evolución del proyecto de principio a fin.

## Estructura

```
prompts/
├── architecture/   ← Decisiones de arquitectura, estructura del proyecto
├── frontend/       ← Componentes, estado, testing frontend
└── backend/        ← Módulos, servicios, testing backend
```

## Formato de cada archivo

Cada prompt sigue esta estructura:

---

**Contexto**: qué se estaba construyendo o decidiendo en ese momento  
**Prompt**: el texto exacto enviado a la IA  
**Resultado**: qué se obtuvo y qué se usó realmente  
**Decisión**: si hubo alguna decisión tomada a partir de la respuesta

---

> Los prompts de producto (ElevenLabs, Azure Speech, etc.) viven en la carpeta `infrastructure/` del feature correspondiente, no aquí.
