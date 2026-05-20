# ididntcatchthat.com — Project Overview

## ¿Qué es este proyecto?

**ididntcatchthat.com** es un juego web de aprendizaje de inglés centrado en cómo los nativos realmente hablan — fonética, connected speech y expresiones reales. Desarrollado como Trabajo de Fin de Máster (TFM).

El nombre lo dice todo: ese momento en el que un nativo habla y simplemente no entiendes nada. La app ataca exactamente ese problema.

El objetivo académico es demostrar ingeniería fullstack moderna con arquitectura profesional, observabilidad cloud-native y uso estratégico de IA — tanto en el proceso de desarrollo como en casos de uso concretos del producto.

---

## Propuesta de valor

Duolingo y Babbel enseñan vocabulario y gramática. **ididntcatchthat** enseña a entender y sonar como un nativo.

El foco está en tres áreas que las apps mainstream ignoran:

- **Fonética real** — los 23 sonidos del inglés, con énfasis en los problemáticos para hispanohablantes.
- **Connected speech** — cómo cambian los sonidos al conectar palabras en una frase real (Flap T, linking, reduction...).
- **Expresiones nativas** — el vocabulario que realmente usan los nativos en conversación.

Y lo que ninguna app hace: **escuchar cada expresión en 3 acentos** (americano, británico, australiano) con audio de calidad generado por síntesis de voz profesional.

---

## Mecánica de juego

La unidad básica es la **flashcard**. Cada flashcard contiene una expresión, fonema o construcción. El flujo es siempre el mismo:

1. **Se presenta la flashcard** — el usuario ve la expresión en inglés.
2. **Auto-evaluación** — el usuario piensa la traducción o significado y marca ✓ o ✗ según si lo sabía. No hay validación automática: el juez es el propio usuario (modelo Anki).
3. **Vista de detalle** — tanto si acertó como si falló, puede ver la ficha completa: significado, ejemplos de uso en contexto, notas fonéticas.
4. **Audio en 3 acentos** — puede escuchar la expresión y sus ejemplos pronunciados por voces nativas sintéticas (americano, británico, australiano).
5. **Bonus de pronunciación** — opcionalmente puede pronunciar él mismo la expresión. Si el análisis de audio valida que suena como un nativo, obtiene puntos extra.

Este diseño permite dos modos de uso sobre el mismo contenido sin cambiar nada: **modo juego** (me evalúo, compito, subo en el ranking) y **modo estudio** (repaso sin presión, escucho, aprendo).

---

## Módulos de contenido

El contenido está curado y organizado en módulos temáticos. El usuario puede jugar en modo aleatorio (todas las categorías mezcladas) o entrar a un módulo específico:

| Módulo                         | Descripción                                                                        | Ejemplo                                    |
| ------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| **Native Sounds**              | Los 23 fonemas del inglés. Juegos centrados en discriminar y producir cada sonido. | Flap T, schwa, /θ/ vs /ð/                  |
| **Connecting Words in Speech** | Cómo cambian los sonidos al conectar palabras. Connected speech real.              | "Red and green" → "rerand green" (Flap T)  |
| **Beautifying Sentences**      | Conectores y estructuras para sonar más fluido y natural.                          | "Not only... but also", "Having said that" |
| **Sounding Native**            | Expresiones coloquiales que usan los nativos y que no se aprenden en clase.        | "stuff", "you guys", "I'm good"            |

---

## Gamificación

El sistema de gamificación está diseñado para mantener el hábito y dar sensación de progresión real:

- **Streaks** — días consecutivos de práctica.
- **Accuracy score** — porcentaje de aciertos global y por módulo.
- **Bonus de pronunciación** — puntos extra por pronunciar correctamente.
- **Ranking** — tabla de clasificación global.
- **Logros** — sistema de insignias por hitos de aprendizaje (módulos completados, rachas, fonemas dominados...).
- **Estadísticas personales** — evolución en el tiempo, módulos más flojos, fonemas con más errores.

---

## Audio: pipeline de generación

El audio es el diferenciador técnico del producto. Cada flashcard tiene asociados archivos de audio generados con **ElevenLabs** (síntesis de voz de alta calidad) en tres voces nativas: americana, británica y australiana.

El pipeline es offline — no ocurre en tiempo real durante el juego:

```
Admin crea flashcard
        ↓
Backend llama a ElevenLabs API (×3 voces)
        ↓
Archivos de audio generados y subidos a CDN
        ↓
Usuario reproduce audio desde CDN (latencia mínima, sin coste por reproducción)
```

Esto garantiza calidad de audio consistente y costes controlados (se genera una vez, se sirve infinitas veces).

---

## Evaluación de pronunciación

El bonus de pronunciación es el único punto donde la IA actúa en tiempo real con el usuario. El usuario graba su voz pronunciando la expresión y recibe una puntuación.

La implementación busca el equilibrio entre calidad y coste. Las opciones evaluadas:

| Opción                      | Coste                  | Calidad                             | Decisión         |
| --------------------------- | ---------------------- | ----------------------------------- | ---------------- |
| Web Speech API              | Gratuita               | Básica                              | Viable para MVP  |
| Azure Speech Service        | Tier gratuito (5h/mes) | Alta, incluye pronunciation scoring | Opción preferida |
| Whisper + análisis fonético | Bajo (Groq)            | Media                               | Alternativa      |

Para el TFM, **Azure Speech Service** es la opción preferida: tiene scoring de pronunciación nativo, tier gratuito generoso y es defendible académicamente.

---

## IA en el proyecto

La IA se usa de forma honesta y acotada, sin inflar su rol:

### En el desarrollo

La IA (Claude, GitHub Copilot) es una herramienta activa durante todo el proceso: scaffolding de arquitectura, generación de tests, revisión de código, documentación. Esto se documenta y reflexiona como parte del TFM — refleja cómo se trabaja en la industria real hoy.

### En el producto

Dos casos de uso concretos y bien definidos:

1. **Generación de audio** (backoffice) — ElevenLabs genera los archivos de audio al crear cada flashcard. Ocurre una vez, no en el flujo del usuario.
2. **Evaluación de pronunciación** (tiempo real) — Azure Speech puntúa la pronunciación del usuario para el bonus de puntos.

No hay IA generativa en el flujo principal del juego. El contenido es curado, no generado dinámicamente. Esto es una decisión de diseño, no una limitación.

---

## Documentación y diagramas

Toda la documentación técnica se escribe en Markdown. Los diagramas (arquitectura, flujos, modelos de datos) se generan con **Mermaid** — embebido directamente en los `.md`, sin herramientas externas ni imágenes que se desactualizan.

---

## Arquitectura

### Enfoque general

**Monolítica modular orientada a dominio** — se descarta microservicios para evitar complejidad operacional innecesaria en el contexto de un TFM, manteniendo la arquitectura escalable y observable.

```
Organización por feature (Screaming Architecture):

flashcards/
  domain/          ← entidades, value objects, reglas de negocio
  application/     ← casos de uso, servicios de aplicación
  infrastructure/  ← repositorios, ORM, adaptadores externos

audio/
  domain/
  application/
  infrastructure/  ← ElevenLabs adapter, CDN uploader

pronunciation/
  domain/
  application/
  infrastructure/  ← Azure Speech adapter
```

### Monorepo

El código se organiza en un monorepo con separación clara entre frontend y backend. Son dos módulos independientes desplegados en la misma VPS — sin código compartido entre ellos. Si en el futuro necesitan escalar por separado, pueden moverse a VPS independientes sin fricción.

- **`apps/api/`** — NestJS, validación con Class Validator
- **`apps/client/`** — React, validación con Zod

---

## Stack tecnológico

### Frontend

| Tecnología         | Rol                        |
| ------------------ | -------------------------- |
| React + TypeScript | UI principal               |
| Vite               | Bundler y dev server       |
| TailwindCSS        | Estilos utilitarios        |
| TanStack Query     | Server state y caché       |
| Zustand            | Client state management    |
| Vitest             | Unit e integration testing |
| Playwright         | E2E testing                |

### Backend

| Tecnología          | Rol                      |
| ------------------- | ------------------------ |
| NestJS + TypeScript | Framework principal      |
| TypeORM             | ORM — solo en `infrastructure/` |
| PostgreSQL (Aiven)  | Base de datos relacional |
| OpenAPI / Swagger   | Contrato de API          |
| Jest                | Testing backend          |

### Infraestructura y tooling

| Tecnología              | Rol                              |
| ----------------------- | -------------------------------- |
| VPS (servidor propio)   | Hosting de todos los servicios   |
| Docker + Docker Compose | Entorno reproducible             |
| GitHub Actions          | CI/CD                            |
| Husky + lint-staged     | Calidad en pre-commit            |
| ESLint + Prettier       | Linting y formato                |
| Makefile                | Comandos del proyecto unificados |
| CDN                     | Servicio de archivos de audio    |

### Hosting

| Servicio                            | Proveedor                                 | Motivo                                         |
| ----------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| Frontend + Backend + Observabilidad | VPS propia                                | Control total, self-hosted, costes predecibles |
| Base de datos (PostgreSQL)          | [Aiven](https://aiven.io/)                | Managed DB, no consume recursos de la VPS      |
| CDN (audio)                         | [Cloudflare](https://www.cloudflare.com/) | Sirve los archivos de audio sin saturar la VPS |

La VPS concentra los servicios de aplicación y observabilidad. La base de datos y el CDN se externalizan deliberadamente para no comprometer el rendimiento del servidor principal.

---

## Observabilidad

Stack self-hosted y gratuito para observabilidad cloud-native:

| Herramienta   | Función                          |
| ------------- | -------------------------------- |
| OpenTelemetry | Instrumentación estándar         |
| Prometheus    | Recolección de métricas          |
| Grafana       | Dashboards técnicos y de negocio |
| Loki          | Logs centralizados               |
| Pino          | Structured logging en Node.js    |

### Métricas técnicas

- Latencia de API, errores, trazas distribuidas
- Llamadas a ElevenLabs y Azure Speech: tiempos, costes, errores
- Rendimiento del CDN

### Métricas de negocio y aprendizaje

- Streaks y retención de usuarios
- Módulos y fonemas con mayor tasa de error
- Distribución de uso por módulo
- Evolución del accuracy score por usuario
- Uso del bonus de pronunciación

---

## Calidad y buenas prácticas

### Testing (pirámide)

```
E2E (Playwright)         — flujo completo de juego, pipeline de audio
Integration Tests        — base de datos, repositorios, APIs externas
Unit Tests               — lógica de negocio, servicios, casos de uso
```

### Ingeniería

- Clean Architecture
- Validación tipada con Zod — contratos compartidos frontend/backend
- ADRs (Architecture Decision Records) para decisiones importantes
- Structured logging con correlation IDs
- CI/CD con GitHub Actions

### Seguridad (OWASP)

- JWT + refresh tokens
- Rate limiting
- Helmet
- Sanitización y validación de inputs
- Zod schemas como primera línea de defensa

---

## Objetivo académico

Este TFM demuestra la capacidad de construir software de calidad profesional en el contexto real de desarrollo con IA:

1. **Desarrollo fullstack moderno** — TypeScript end-to-end, contratos compartidos, developer experience cuidada
2. **Producto con valor real** — propuesta de valor clara, diferenciada y honesta
3. **Arquitectura profesional** — modular, orientada a dominio, mantenible y escalable
4. **Observabilidad cloud-native** — métricas, tracing y logs desde el día uno
5. **Integración de IA estratégica** — usada donde aporta valor real, no como decoración
6. **Calidad de software** — testing piramidal, CI/CD, linting, seguridad

> El foco no es solo que funcione — es que esté **bien construido** y **bien razonado**.
