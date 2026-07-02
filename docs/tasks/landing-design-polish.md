# Landing design polish

Rama: `feat/landing-design-polish` (desde `feat/professional-landing-nav-fix`)

## Objetivo

Aplicar las 7 mejoras de diseño/UX identificadas en la revisión de la landing pública.

## Cambios

| # | Mejora | Implementación |
|---|--------|----------------|
| 1 | Jerarquía del hero | CTA primario Play + secundario Sign up; enlaces terciarios Study / How it works / Get started |
| 2 | Header sticky | `LandingHeader` fijo con blur, logo, anclas y auth |
| 3 | i18n demo y módulos | Cartas demo y `examples` por módulo en `en.ts` / `es.ts` |
| 4 | Ritmo visual | Bordes entre secciones; demo ancho completo; problem 2 columnas en desktop; how-it-works con fondo sutil |
| 5 | Footer útil | Nav con anclas + login/register + acentos |
| 6 | Prueba social | `LandingTrustBar` con 3 highlights bajo el hero |
| 7 | Ancla CTA final | `#get-started` en header, hero y footer |

## Archivos principales

- `containers/landing/components/LandingHeader.tsx` (nuevo)
- `containers/landing/components/LandingTrustBar.tsx` (nuevo)
- `containers/landing/components/LandingHero.tsx`
- `containers/landing/components/LandingGameDemo.tsx`
- `containers/landing/components/LandingProblem.tsx`
- `containers/landing/components/LandingModules.tsx`
- `containers/landing/components/LandingHowItWorks.tsx`
- `containers/landing/components/LandingFooter.tsx`
- `containers/landing/LandingComponent.tsx`
- `core/i18n/{en,es}.ts`, `i18n.types.ts`

## Test plan

- [ ] Header visible al scroll; anclas `#how-it-works` y `#get-started` funcionan
- [ ] Hero: Play abre auth gate; Sign up va a `/auth/register`
- [ ] Trust bar muestra 3 items en EN y ES
- [ ] Demo cards usan copy i18n; módulos muestran examples localizados
- [ ] Problem en 2 columnas en viewport ≥ lg
- [ ] Footer enlaces correctos

## PR

`feat/landing-design-polish` → `dev` (squash merge), tras merge de la rama de landing/nav si aplica.
